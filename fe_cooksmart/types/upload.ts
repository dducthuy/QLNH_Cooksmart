export interface UploadData {
  url: string;
  filename: string;
  size?: number;
}

export interface UploadResponse {
  status: "success" | "error";
  data: UploadData;
  message?: string;
}
