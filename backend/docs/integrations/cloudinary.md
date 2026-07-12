# Cloudinary Integration Details

WollyWay integrates with Cloudinary for secure server-side image upload and optimization.

## Environment Variables Required
*   `CLOUDINARY_CLOUD_NAME`: Cloudinary account name.
*   `CLOUDINARY_API_KEY`: Account API key for signed operations.
*   `CLOUDINARY_API_SECRET`: Secret key (kept secure on server).

## Folder Structure
```
wollyway/
├── dev/
│   ├── products/
│   ├── categories/
│   ├── users/
│   │   ├── avatars/
│   │   └── documents/
│   └── temp/
├── staging/
│   └── ...
└── prod/
    ├── products/
    ├── categories/
    ├── users/
    │   ├── avatars/
    │   └── documents/
    ├── banners/
    └── temp/
```

## Public ID Format
Public IDs are generated with contextual descriptive paths:
`wollyway/{NODE_ENV}/products/{product-slug}/{uuid}`

*Example*: `wollyway/prod/products/handmade-knit-beanie/9b1deb4d-3b7d`

## Cleanup & Retention Policies
*   **Orphaned Assets**: If a database write fails after uploading to Cloudinary, an automatic service rollback destroys the asset immediately.
*   **Temporary Directory (`temp/`)**: Managed via a Cloudinary TTL policy set to auto-expire and delete files older than 24 hours.

## CDNs & Performance (f_auto, q_auto)
Cloudinary delivers all assets through Fastly/Cloudflare CDNs at the edge. We enforce:
*   `f_auto`: Automatically serve AVIF/WebP where supported to minimize bandwidth.
*   `q_auto`: Dynamic quality compression to serve lightweight images without human-eye visual degradation.
*   **Responsive Widths**: Managed on the frontend using Next.js Image component coupled with backend transformations.
