// Качване в Google Drive от името на потребителя (OAuth refresh token).
//
// ЗАЩО НЕ SERVICE ACCOUNT: service account няма собствена дискова квота. Когато
// създаде файл, той става негов собственик и Google отказва с „Service Accounts
// do not have storage quota". Заобикалянията (Shared Drive, domain-wide
// delegation) искат Google Workspace, а това е личен Gmail.
//
// С OAuth файловете се създават ОТ ИМЕТО НА ПОТРЕБИТЕЛЯ, в неговата квота, и
// той им е собственик — точно каквото трябва.
//
// ЗАЩО НЕ MCP КОНЕКТОР: през него всеки байт минава като base64 през контекста
// на модела. Един пуск от 12 PNG-та е ~10 MB, тоест милиони токени.

import { google } from 'googleapis';
import { createReadStream } from 'node:fs';
import { basename, extname } from 'node:path';

const MIME = { '.png': 'image/png', '.html': 'text/html', '.txt': 'text/plain', '.json': 'application/json' };

export function driveClient({ clientId, clientSecret, refreshToken }) {
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Липсват OAuth данни (client id / secret / refresh token).');
  }
  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth });
}

const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");

/** Намира подпапка по име или я създава. Прави пуска идемпотентен:
 *  повторно пускане в същия ден допълва папката, вместо да прави дубликат. */
export async function ensureFolder(drive, parentId, name) {
  const q = [
    `'${esc(parentId)}' in parents`,
    `name = '${esc(name)}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false',
  ].join(' and ');

  const found = await drive.files.list({ q, fields: 'files(id,name)', pageSize: 1 });
  if (found.data.files?.length) return found.data.files[0].id;

  const made = await drive.files.create({
    requestBody: { name, mimeType: 'application/vnd.google-apps.folder', parents: [parentId] },
    fields: 'id',
  });
  return made.data.id;
}

/** Качва файл; ако вече има такъв с това име в папката, го подменя. */
export async function uploadFile(drive, folderId, path) {
  const name = basename(path);
  const mimeType = MIME[extname(path).toLowerCase()] || 'application/octet-stream';

  const existing = await drive.files.list({
    q: `'${esc(folderId)}' in parents and name = '${esc(name)}' and trashed = false`,
    fields: 'files(id)', pageSize: 1,
  });

  const media = { mimeType, body: createReadStream(path) };
  if (existing.data.files?.length) {
    const res = await drive.files.update({ fileId: existing.data.files[0].id, media, fields: 'id,name' });
    return res.data;
  }
  const res = await drive.files.create({
    requestBody: { name, parents: [folderId] }, media, fields: 'id,name',
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
