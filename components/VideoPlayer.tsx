interface Props { vimeoId: string }
export default function VideoPlayer({ vimeoId }: Props) {
const id = vimeoId.replace(/[^0-9]/g, "");
return (
<div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
<iframe
src={`https://player.vimeo.com/video/${id}`}
className="h-full w-full"
allow="autoplay; fullscreen; picture-in-picture"
allowFullScreen
/>
</div>
);
}