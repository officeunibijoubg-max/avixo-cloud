// Качване в Google Drive през service account.
//
// Защо service account, а не конектор: файловете се качват от сървъра директно
// към Drive API. През MCP конектор всеки байт минава като base64 през контекста
// на модела — един пуск от 12 PNG-та е ~10 MB, тоест милиони токени.

import { google } from 'googleapis';
import { createReadStream } from 'node:fs';
import { basename, extname } from 'node:path';

const MIME = { '.png': 'image/png', '.html': 'text/html', '.txt': 'text/plain', '.json': 'application/json' };

export function driveClient(serviceAccountJson) {
  const creds = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
}

/** Намира подпапка по име или я създава. Прави пуска идемпотентен:
 *  повторно пускане в същия ден допълва папката, вместо да прави дубликат. */
export async function ensureFolder(drive, parentId, name) {
  const q = [
    `'${parentId}' in parents`,
    `name = '${name.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ].join(' and ');

  const found = await drive.files.list({
    q, fields: 'files(id,name)', pageSize: 1,
    supportsAllDrives: true, includeItemsFromAllDrives: true,
  });
  if (found.data.files?.length) return found.data.files[0].id;

  const made = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id', supportsAllDrives: true,
  });
  return made.data.id;
}

/** Качва файл; ако вече има такъв с това име в папката, го подменя. */
export async function uploadFile(drive, folderId, path) {
  const name = basename(path);
  const mimeType = MIME[extname(path).toLowerCase()] || 'application/octet-stream';

  const existing = await drive.files.list({
    q: `'${folderId}' in parents and name = '${name.replace(/'/g, "\\'")}' and trashed = false`,
    fields: 'files(id)', pageSize: 1,
    supportsAllDrives: true, includeItemsFromAllDrives: true,
  });

  const media = { mimeType, body: createReadStream(path) };
  if (existing.data.files?.length) {
    const res = await drive.files.update({
      fileId: existing.data.files[0].id, media, fields: 'id,name', supportsAllDrives: true,
    });
    return res.data;
  }
  const res = await drive.files.create({
    requestBody: { name, parents: [folderId] }, media, fields: 'id,name', supportsAllDrives: true,
  });
  return res.data;
}

export async function uploadAll(drive, folderId, paths) {
  const out = [];
  for (const p of paths) {
    out.push(await uploadFile(drive, folderId, p));
    console.log(`  ↑ ${basename(p)}`);
  }
  return out;
}
