import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('VITE_SUPABASE_URL atau SUPABASE_SERVICE_KEY belum diisi di .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const TARGET_DIR = path.join(process.cwd(), 'public', 'images', 'products');

const ensureDir = () => {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
    console.log('Folder dibuat:', TARGET_DIR);
  }
};

const listAllFiles = async () => {
  const all = [];
  const limit = 100;
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage
      .from('products')
      .list('', { limit, offset });

    if (error) throw error;
    if (!data || data.length === 0) break;

    all.push(...data);
    if (data.length < limit) break;
    offset += limit;
  }

  return all;
};

const downloadFile = async (fileName) => {
  const targetPath = path.join(TARGET_DIR, fileName);

  if (fs.existsSync(targetPath)) {
    console.log('Lewati (sudah ada):', fileName);
    return;
  }

  const { data: signed } = await supabase.storage
    .from('products')
    .createSignedUrl(fileName, 120);

  if (!signed?.signedUrl) {
    console.warn('Gagal buat signed URL:', fileName);
    return;
  }

  const response = await fetch(signed.signedUrl);
  if (!response.ok) {
    console.warn('Gagal download:', fileName);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);
  console.log('Tersimpan:', fileName);
};

const main = async () => {
  ensureDir();
  console.log('Mengambil daftar file dari bucket products...');

  const files = await listAllFiles();
  console.log('Total file ditemukan:', files.length);

  if (files.length === 0) {
    console.log('Tidak ada file untuk disinkronkan.');
    return;
  }

  for (const file of files) {
    if (file.name) {
      await downloadFile(file.name);
    }
  }

  console.log('Selesai. File tersimpan di', TARGET_DIR);
};

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});