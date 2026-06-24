import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // List all files in the Vercel Blob store
    console.log("DEBUG: Calling Vercel Blob list()...");
    const { blobs } = await list();
    console.log(`DEBUG: Vercel Blob list() returned ${blobs ? blobs.length : 0} blobs`);
    
    // Filter to only include common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
    const imageBlobs = blobs.filter(blob => {
      const pathname = blob.pathname.toLowerCase();
      return imageExtensions.some(ext => pathname.endsWith(ext));
    });

    // Map each blob to a clean photo structure (url, caption)
    const images = imageBlobs.map((blob, idx) => {
      const filename = blob.pathname.split('/').pop().split('.').shift();
      let caption = "Kỷ niệm đẹp";
      
      const CAPTIONS = [
        "Lớp học lập trình đầu tiên: Hello World!",
        "Những đêm thức trắng cùng đồ án tốt nghiệp",
        "Buổi thuyết trình đầy thử thách nhưng thành công",
        "Khoảnh khắc bứt phá đầy tự hào của thanh xuân",
        "UEH thân thương: nơi lưu giữ kỷ niệm tuổi trẻ",
        "Ngày hội tốt nghiệp rực rỡ sắc màu",
        "Nụ cười rạng rỡ đánh dấu một chương mới"
      ];

      // If the filename is descriptive, turn it into a caption
      if (filename && filename.length >= 3 && !/^\d+$/.test(filename) && !/^[a-f0-9]{10,}$/i.test(filename)) {
        const cleanName = filename.replace(/[-_]/g, ' ');
        caption = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
      } else {
        caption = CAPTIONS[idx % CAPTIONS.length];
      }

      return {
        url: `/api/images/proxy?url=${encodeURIComponent(blob.url)}`,
        caption
      };
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error("Vercel Blob listing error:", error);
    // Return empty list on error (client will automatically fall back to presets)
    return NextResponse.json([], { status: 200 });
  }
}
