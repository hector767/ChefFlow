export default function LoadingScreen({ label = "Loading" }: { label?: string }) {
    return (
        <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-900">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin" />
                <div className="text-sm text-slate-500">{label}…</div>
            </div>
        </div>
    );
}