INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'kx-resource-files',
  'kx-resource-files',
  false,
  10485760,
  ARRAY[
    'text/csv',
    'application/json',
    'application/yaml',
    'text/markdown',
    'text/plain',
    'application/pdf',
    'application/zip',
    'application/octet-stream',
    'application/x-ipynb+json',
    'text/x-python'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
