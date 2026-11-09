/**
 * 移动端 Composer 上传图片的本地示例（Figma 5271:64305）。
 * 「拍照」「从相册选择」不调起相机或相册，只从下列本地素材中取图并模拟上传过程。
 * 相册每次返回 3 张，其中第 2 张首次上传固定失败，用来演示「失败 → 点击重试」状态。
 */
export type UploadSample = { name: string; src: string; size: number }

export const cameraSamples: readonly UploadSample[] = [
  { name: "拍照.jpg", src: "/generated-banners/smart-manufacturing.png", size: 2025744 },
]

export const albumSamples: readonly UploadSample[] = [
  { name: "相册图片-1.jpg", src: "/figma-home/2e34c.png", size: 186_000 },
  { name: "相册图片-2.jpg", src: "/generated-banners/smart-living.png", size: 2287724 },
  { name: "相册图片-3.jpg", src: "/figma-home/8c4dc.png", size: 172_000 },
]

/** 相册中首次上传会失败的样例序号（从 0 开始） */
export const ALBUM_FAIL_ONCE_INDEX = 1

/** 模拟上传耗时（毫秒） */
export const UPLOAD_DURATION = 1200
