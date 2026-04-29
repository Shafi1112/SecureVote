import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, IdCard, Mail, Upload } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import api, { mediaUrl } from "../services/api";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const cardRef = useRef(null);

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profilePhoto", file);
    setUploading(true);
    try {
      await api.put("/users/profile-photo", formData, { headers: { "Content-Type": "multipart/form-data" } });
      await refreshUser();
      toast.success("Profile photo updated");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const downloadPdf = async () => {
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [520, 320] });
    pdf.addImage(img, "PNG", 0, 0, 520, 320);
    pdf.save(`${user.voterId}-card.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <p className="text-xs font-bold uppercase tracking-wider text-mint">Identity center</p>
        <h2 className="page-title mt-2">Profile & Voter ID</h2>
        <p className="page-subtitle">Manage your voter identity and download your digital card.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="panel p-5">
          <h3 className="text-lg font-black text-ink">Profile</h3>
          <div className="mt-5 flex items-center gap-4">
            <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-xl bg-slate-100 text-3xl font-black text-slatebrand">
              {user.profilePhoto ? <img src={mediaUrl(user.profilePhoto)} alt={user.name} className="h-full w-full object-cover" /> : user.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black text-ink">{user.name}</p>
              <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500"><Mail size={15} /> {user.email}</p>
              <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-mint">
                <IdCard size={14} />
                {user.voterId}
              </p>
            </div>
          </div>
          <label className="btn-secondary mt-6 w-full cursor-pointer">
            <Upload size={18} />
            {uploading ? "Uploading..." : "Upload photo"}
            <input type="file" accept="image/*" hidden onChange={uploadPhoto} />
          </label>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-ink">Digital Voter ID</h3>
              <p className="text-sm text-slate-500">QR code contains your unique SecureVote reference.</p>
            </div>
            <button className="btn-primary" onClick={downloadPdf}><Download size={18} /> Download PDF</button>
          </div>
          <div ref={cardRef} className="max-w-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="bg-ink p-5 text-white">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-100">SecureVote voter card</p>
              <h3 className="mt-2 text-2xl font-black">{user.name}</h3>
              <p className="text-sm text-slate-200">{user.email}</p>
            </div>
            <div className="flex items-end justify-between gap-5 p-5">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Voter ID</p>
                <p className="mt-1 text-xl font-black text-ink">{user.voterId}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <QRCodeCanvas value={JSON.stringify({ voterId: user.voterId, userId: user.id })} size={112} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
