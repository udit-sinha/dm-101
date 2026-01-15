/**
 * File Storage API Client
 * 
 * Provides typed API methods for file and folder operations.
 * All endpoints are backed by the StorageService which uses
 * the configured storage provider (local, S3, GCS, etc).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// =============================================================================
// TYPES
// =============================================================================

export interface FileMetadata {
    id: string;
    name: string;
    path: string;
    size: number;
    mimeType: string;
    isDirectory: boolean;
    createdAt: string;
    modifiedAt: string;
    parentPath: string | null;
}

export interface FolderNode {
    id: string;
    name: string;
    path: string;
    children: FolderNode[];
}

export interface PaginatedFiles {
    files: FileMetadata[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface UploadResult {
    uploaded: FileMetadata[];
    errors: { filename: string; error: string }[];
    totalUploaded: number;
    totalErrors: number;
}

export interface UploadProgress {
    filename: string;
    loaded: number;
    total: number;
    percent: number;
}

// =============================================================================
// API METHODS
// =============================================================================

/**
 * Get the folder tree structure for the directory sidebar.
 */
export async function getFolderTree(root: string = "/"): Promise<FolderNode[]> {
    const response = await fetch(`${API_BASE}/api/files/folders?root=${encodeURIComponent(root)}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch folders: ${response.statusText}`);
    }
    const data = await response.json();
    return data.folders;
}

/**
 * Create a new folder.
 */
export async function createFolder(path: string): Promise<FileMetadata> {
    const response = await fetch(`${API_BASE}/api/files/folders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to create folder: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Delete a folder.
 */
export async function deleteFolder(path: string, recursive: boolean = false): Promise<void> {
    const response = await fetch(
        `${API_BASE}/api/files/folders?path=${encodeURIComponent(path)}&recursive=${recursive}`,
        { method: 'DELETE' }
    );
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to delete folder: ${response.statusText}`);
    }
}

/**
 * List files in a directory with pagination.
 */
export async function listFiles(
    path: string,
    page: number = 1,
    pageSize: number = 20,
    search?: string
): Promise<PaginatedFiles> {
    const params = new URLSearchParams({
        path,
        page: page.toString(),
        page_size: pageSize.toString(),
    });
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE}/api/files/list?${params}`);
    if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Search for files matching a query.
 */
export async function searchFiles(
    query: string,
    path?: string,
    page: number = 1,
    pageSize: number = 20
): Promise<PaginatedFiles> {
    const params = new URLSearchParams({
        query,
        page: page.toString(),
        page_size: pageSize.toString(),
    });
    if (path) params.append('path', path);

    const response = await fetch(`${API_BASE}/api/files/search?${params}`);
    if (!response.ok) {
        throw new Error(`Failed to search files: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Upload files to a directory with progress tracking.
 */
export async function uploadFiles(
    path: string,
    files: File[],
    onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable && onProgress) {
                onProgress({
                    filename: files.length === 1 ? files[0].name : `${files.length} files`,
                    loaded: event.loaded,
                    total: event.total,
                    percent: Math.round((event.loaded / event.total) * 100),
                });
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText));
                } catch {
                    reject(new Error('Invalid response from server'));
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.detail || 'Upload failed'));
                } catch {
                    reject(new Error(`Upload failed: ${xhr.statusText}`));
                }
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

        xhr.open('POST', `${API_BASE}/api/files/upload?path=${encodeURIComponent(path)}`);
        xhr.send(formData);
    });
}

/**
 * Download a file.
 */
export async function downloadFile(path: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/files/download?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const blob = await response.blob();
    const filename = path.split('/').pop() || 'download';

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

/**
 * Delete a file.
 */
export async function deleteFile(path: string): Promise<void> {
    const response = await fetch(
        `${API_BASE}/api/files/file?path=${encodeURIComponent(path)}`,
        { method: 'DELETE' }
    );
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to delete file: ${response.statusText}`);
    }
}

/**
 * Move or rename a file/folder.
 */
export async function moveFile(source: string, destination: string): Promise<FileMetadata> {
    const response = await fetch(`${API_BASE}/api/files/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, destination }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `Failed to move file: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Get metadata for a file or folder.
 */
export async function getFileMetadata(path: string): Promise<FileMetadata> {
    const response = await fetch(`${API_BASE}/api/files/metadata?path=${encodeURIComponent(path)}`);
    if (!response.ok) {
        throw new Error(`Failed to get metadata: ${response.statusText}`);
    }
    return response.json();
}
