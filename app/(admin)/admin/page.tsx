import { adminReviewSeller, adminUpdateProduct, updateAdminNotificationSettings } from "@/lib/actions";
import { getAdminRole } from "@/lib/admin-session";
import { readDb } from "@/lib/db";

export default async function AdminPage() {
  const role = await getAdminRole();
  const db = await readDb();
  const allowed = role === "ceo" || role === "super_admin";

  if (!allowed) {
    return (
      <main className="shell">
        <section className="empty-state"><h2>Admin access required</h2><p className="muted">Only CEO and Super Admin roles can manage Trust Bay.</p></section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="page-title"><h1>Admin / CEO Dashboard</h1><p>Approvals, products, reports, payments, disputes, accounts, renewals, and notification logs.</p></section>
      <section className="dashboard-panel">
        <div className="metric-grid">
          <div className="metric"><span>Users</span><strong>{db.users.length}</strong></div>
          <div className="metric"><span>Products</span><strong>{db.products.length}</strong></div>
          <div className="metric"><span>Reports</span><strong>{db.reports.length}</strong></div>
          <div className="metric"><span>Email logs</span><strong>{db.notificationLogs.length}</strong></div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Admin Notification Settings</h2><p>Set the two admin emails and any inboxes that should receive copies of platform notifications.</p></div>
        <section className="form-panel">
          <form className="form-grid" action={updateAdminNotificationSettings}>
            <label className="field">Admin 1 email (CEO)<input name="adminEmailOne" type="email" defaultValue={db.platformSettings.adminEmails[0] || ""} /></label>
            <label className="field">Admin 2 email (Super Admin)<input name="adminEmailTwo" type="email" defaultValue={db.platformSettings.adminEmails[1] || ""} /></label>
            <label className="wide">Notification copy emails<textarea name="notificationEmails" defaultValue={db.platformSettings.notificationEmails.join(", ")} placeholder="admin1@example.com, admin2@example.com" /></label>
            <button className="btn dark">Save Admin Emails</button>
          </form>
        </section>
      </section>

      <section className="section">
        <div className="section-head"><h2>Marketplace Seller Approvals</h2></div>
        <div className="table"><table><tbody>
          <tr><th>Seller</th><th>Matric No.</th><th>Dept / Level</th><th>School</th><th>ID Photo</th><th>Biodata Photo</th><th>Status</th><th>Action</th></tr>
          {db.sellerProfiles.filter((profile) => profile.sellerType === "physical").map((profile) => {
            const seller = db.users.find((item) => item.id === profile.userId);
            return <tr key={profile.id}>
              <td>{seller?.fullName}<br />{seller?.email}</td>
              <td>{seller?.matricNumberEncrypted || "—"}</td>
              <td>{seller?.department || "—"} {seller?.level ? `/ ${seller.level}` : ""}</td>
              <td>{profile.schoolInfo}</td>
              <td>
                {profile.idPhotoUrl
                  ? <a href={profile.idPhotoUrl} target="_blank" rel="noopener noreferrer">
                      <img src={profile.idPhotoUrl} alt="ID" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                    </a>
                  : "—"}
              </td>
              <td>
                {profile.biodataPhotoUrl
                  ? <a href={profile.biodataPhotoUrl} target="_blank" rel="noopener noreferrer">
                      <img src={profile.biodataPhotoUrl} alt="Biodata" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 6 }} />
                    </a>
                  : "—"}
              </td>
              <td>{profile.status}</td>
              <td>
                <form action={adminReviewSeller} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="hidden" name="profileId" value={profile.id} />
                  <select name="status"><option>approved</option><option>rejected</option><option>pending</option><option>removed</option></select>
                  <input name="reason" placeholder="Reason" />
                  <button className="btn dark">Save</button>
                </form>
              </td>
            </tr>;
          })}
        </tbody></table></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Products</h2></div>
        <div className="table"><table><tbody>
          <tr><th>Title</th><th>Type</th><th>Status</th><th>Action</th></tr>
          {db.products.map((product) => <tr key={product.id}><td>{product.title}</td><td>{product.productType}</td><td>{product.status}</td><td>
            <form action={adminUpdateProduct} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="hidden" name="productId" value={product.id} />
              <select name="status"><option>active</option><option>taken_down</option><option>removed</option><option>sold</option></select>
              <button className="btn dark">Update</button>
            </form>
          </td></tr>)}
        </tbody></table></div>
      </section>

      <section className="section">
        <div className="section-head"><h2>Notification Log</h2></div>
        <div className="table"><table><tbody>
          <tr><th>Type</th><th>Recipient</th><th>Status</th><th>Subject</th></tr>
          {db.notificationLogs.slice(-40).reverse().map((log) => <tr key={log.id}><td>{log.type}</td><td>{log.recipientEmail}</td><td>{log.status}</td><td>{log.subject}</td></tr>)}
        </tbody></table></div>
      </section>
    </main>
  );
}