#!/usr/bin/env python3
"""Генерира записания глас: по един MP3 за всяка фраза от docs/voice-script.csv.

Гласовете (виж src/config/voices.ts) са в отделни папки public/audio/<глас>/:
  lili, eli     — женски, Supertonic 3 (pip install supertonic; лиценз OpenRAIL)
  georgi        — мъжки, Supertonic 3
  dimitar       — мъжки, Piper bg_BG-dimitar-medium (pip install piper-tts; MIT/CC0)

  npm run voice-script                                   # обновява docs/voice-script.csv
  python3 scripts/generate-voice.py --voice lili
  python3 scripts/generate-voice.py --voice dimitar --model path/to/bg_BG-dimitar-medium.onnx

Прави само новите/променените фрази (помни текста в <папка>/generated.json) и
маха файловете на фрази, които вече ги няма. Запис на ръка се слага в
public/audio/<id>.mp3 (не в папка на глас) и е с предимство пред всички гласове.
"""
import argparse, csv, io, json, os, re, wave

import lameenc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(ROOT, "docs", "voice-script.csv")

# Supertonic: гласове от модела; Piper: отделен модел.
VOICES = {
    "lili": ("supertonic", "F5"),
    "eli": ("supertonic", "F3"),
    "georgi": ("supertonic", "M5"),
    "dimitar": ("piper", None),
}

# Самотна главна гласна е звукът на буквата („Това е А.“): Piper без ударение я казва
# като неударено „ъ“, а „Ъ“ — като „ер голям“. Слагаме ударение (само за Piper).
VOWEL = re.compile(r"(?<![\wА-яЁё])([АЕИОУЪЮЯ])(?![\wА-яЁё])")


def piper_prepare(text: str) -> str:
    return VOWEL.sub(lambda m: m.group(1).lower() + "́", text)


def to_mp3(pcm16: bytes, rate: int, bitrate: int) -> bytes:
    enc = lameenc.Encoder()
    enc.set_bit_rate(bitrate)
    enc.set_in_sample_rate(rate)
    enc.set_channels(1)
    enc.set_quality(2)
    return enc.encode(pcm16) + enc.flush()


def make_synth(voice: str, model: str | None, speed: float | None):
    engine, style = VOICES[voice]
    if engine == "piper":
        from piper import PiperVoice
        from piper.config import SynthesisConfig

        if not model:
            raise SystemExit("--model е задължителен за Piper")
        pv = PiperVoice.load(model)
        cfg = SynthesisConfig(length_scale=speed or 1.15)

        def synth(text: str) -> tuple[bytes, int]:
            buf = io.BytesIO()
            with wave.open(buf, "wb") as w:
                pv.synthesize_wav(piper_prepare(text), w, syn_config=cfg)
            buf.seek(0)
            with wave.open(buf, "rb") as w:
                return w.readframes(w.getnframes()), w.getframerate()

        return synth

    import numpy as np
    from supertonic import TTS

    tts = TTS(auto_download=True)
    st = tts.get_voice_style(voice_name=style)

    def synth(text: str) -> tuple[bytes, int]:
        wav, _ = tts.synthesize(text, voice_style=st, lang="bg", speed=speed or 0.95)
        pcm = (np.clip(np.asarray(wav).reshape(-1), -1, 1) * 32767).astype("<i2").tobytes()
        return pcm, tts.sample_rate

    return synth


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", required=True, choices=sorted(VOICES))
    ap.add_argument("--model", help="ONNX модел на Piper (само за dimitar)")
    ap.add_argument("--speed", type=float, help="темпо (Piper: length_scale, >1 по-бавно; Supertonic: <1 по-бавно)")
    ap.add_argument("--bitrate", type=int, default=40)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    out_dir = os.path.join(ROOT, "public", "audio", args.voice)
    os.makedirs(out_dir, exist_ok=True)
    state_path = os.path.join(out_dir, "generated.json")
    state = json.load(open(state_path, encoding="utf-8")) if os.path.exists(state_path) else {}
    with open(CSV, encoding="utf-8-sig") as f:
        lines = list(csv.DictReader(f))

    synth = None
    made = 0
    for i, row in enumerate(lines):
        rid, text = row["id"], row["текст"]
        path = os.path.join(out_dir, f"{rid}.mp3")
        if os.path.exists(path) and state.get(rid) == text and not args.force:
            continue
        synth = synth or make_synth(args.voice, args.model, args.speed)
        pcm, rate = synth(text)
        with open(path, "wb") as out:
            out.write(to_mp3(pcm, rate, args.bitrate))
        state[rid] = text
        made += 1
        if made % 100 == 0:
            print(f"{args.voice}: {made} (ред {i + 1}/{len(lines)})", flush=True)
            json.dump(state, open(state_path, "w", encoding="utf-8"), ensure_ascii=False)

    ids = {r["id"] for r in lines}
    for rid in [r for r in state if r not in ids]:
        p = os.path.join(out_dir, f"{rid}.mp3")
        if os.path.exists(p):
            os.remove(p)
        del state[rid]
    for name in os.listdir(out_dir):
        if name.endswith(".mp3") and name[:-4] not in ids:
            os.remove(os.path.join(out_dir, name))

    with open(state_path, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(state.items())), f, ensure_ascii=False, indent=0)
    print(f"{args.voice}: нови/обновени {made}, общо {len(lines)}")


if __name__ == "__main__":
    main()
