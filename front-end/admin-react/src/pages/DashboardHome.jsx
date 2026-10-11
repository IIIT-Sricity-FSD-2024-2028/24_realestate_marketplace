import PageHeader from '../components/PageHeader.jsx';
import { StatCard } from '../components/StatCard.jsx';

/**
 * Dashboard landing section (was data-section="dashboard").
 * The three KPI cards are ported exactly as the old page had them — those
 * figures were written into the HTML and were never loaded from the API.
 */
export default function DashboardHome() {
  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Manage your buyers, sellers, and property deals" />
      <div className="page-body">
        <div className="grid grid-3">
          <StatCard icon="users" color="#1DB954" tint="rgba(29,185,84,0.15)" trend="+12%" value="3" label="Current Buyers" />
          <StatCard icon="seller" color="#f97316" tint="rgba(249,115,22,0.15)" trend="+8%" value="2" label="Current Sellers" />
          <StatCard icon="checkCircle" color="#1DB954" tint="rgba(29,185,84,0.15)" trend="+3" value="12" label="Deals Closed" />
        </div>
      </div>
    </>
  );
}
