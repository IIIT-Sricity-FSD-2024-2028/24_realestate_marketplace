/**
 * SellerDashboardPage.jsx - Page Construction & Architecture Plan
 * ============================================================================
 * [PURPOSE]: Top-level workspace shell for authenticated seller users.
 * [INPUTS]:  Active URL route (/seller/:section), auth session token in storage.
 * [OUTPUTS]: Unified DashboardLayout wrapping the currently selected tab section.
 * [APIs]:    Shared seller polling hook useSellerData (refreshes every 15 seconds).
 *
 * [ROUTING & NAVIGATION STRUCTURE]:
 * 1. Top-level Menu Items (NAV configuration):
 *    - dashboard: "Dashboard" overview (icon: grid)
 *    - properties: group containing "My Listings" (key: my-listings)
 *    - buyerMgmt: group containing "Negotiate" and "Track Payment"
 *    - soldRented: group containing "Sold Properties" and "Rent Given Properties"
 *    - billing: "Billing & Plans" (icon: card)
 *    - notifications: "Notifications" feed (icon: bell)
 *    - profile: "Profile" management (icon: user)
 * 2. Hidden sub-routes:
 *    - "add-property": accessible via action button, highlights "my-listings" tab.
 *
 * [HOOKS & STATE ORCHESTRATION]:
 * 1. useNavigate: programmatic redirection on logout.
 * 2. useDashboardSection: manages active section key from path params.
 * 3. useSellerData: fetches listings, negotiations, purchases, billing status.
 * 4. useAccountProfile("sellerProfile"): retrieves full name and profile details.
 * 5. useLiveRefresh: polls backend every 15s; triggers sessionChanged indicator.
 *
 * [SECTION COMPONENT MAPPING]:
 * - dashboard      -> <SellerOverview {...props} />
 * - my-listings    -> <MyListingsSection {...props} />
 * - add-property   -> <AddPropertySection {...props} />
 * - negotiate      -> <SellerNegotiationsSection {...props} />
 * - track-payment  -> <TrackPaymentsSection {...props} />
 * - sold           -> <ClosedDealsSection {...props} mode="sale" />
 * - rent-given     -> <ClosedDealsSection {...props} mode="rent" />
 * - billing        -> <BillingSection {...props} />
 * - notifications  -> <SellerNotificationsSection {...props} />
 * - profile        -> <SellerProfileSection {...props} />
 *
 * [CONSTRUCTION STEPS]:
 * [ ] Step 1: Configure NAV array with icons, group labels, and child routes.
 * [ ] Step 2: Extract valid URL keys combining navigation items and sub-routes.
 * [ ] Step 3: Initialize dashboard section hook bound to base path "/seller".
 * [ ] Step 4: Initialize live data provider and account profile hooks.
 * [ ] Step 5: Configure logout callback clearing auth session and redirecting.
 * [ ] Step 6: Render DashboardLayout with sidebar, header, active route, and children.
 * [ ] Step 7: Support dynamic mobile drawer toggle and route transitions.
 * [ ] Step 8: Synchronize session state upon logout or role changes.
 * ============================================================================
 */
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout.jsx";
import { useDashboardSection } from "../../hooks/useDashboardSection.js";
import { useLiveRefresh } from "../../hooks/useLiveRefresh.js";
import { clearUser, logoutPathForRole } from "../../auth/session.js";
import { useAccountProfile } from "../../components/profile/ProfileSections.jsx";
import { useSellerData } from "./useSellerData.js";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "grid" },
  { group: "properties", label: "Properties", icon: "home", items: [{ key: "my-listings", label: "My Listings" }] },
  { group: "buyerMgmt", label: "Buyer Management", icon: "users", items: [{ key: "negotiate", label: "Negotiate" }, { key: "track-payment", label: "Track Payment" }] },
  { group: "soldRented", label: "Sold/Rented", icon: "checkCircle", items: [{ key: "sold", label: "Sold Properties" }, { key: "rent-given", label: "Rent Given Properties" }] },
  { key: "billing", label: "Billing & Plans", icon: "card" },
  { key: "notifications", label: "Notifications", icon: "bell" },
  { key: "profile", label: "Profile", icon: "user" },
];
const KEYS = [...NAV.flatMap((n) => (n.items ? n.items.map((i) => i.key) : [n.key])), "add-property"];

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [active, goTo] = useDashboardSection("/seller", "seller", KEYS, "dashboard");
  const data = useSellerData();
  const account = useAccountProfile("sellerProfile");
  const { sessionChanged } = useLiveRefresh(data.reloadAll, { role: "seller", intervalMs: 15000 });

  const logout = () => {
    clearUser();
    navigate(logoutPathForRole("seller"));
  };

  return (
    <DashboardLayout
      badge="Seller"
      nav={NAV}
      active={active === "add-property" ? "my-listings" : active}
      onNavigate={goTo}
      user={{ name: account.fullName, subtitle: "Seller Account" }}
      onLogout={logout}
      sessionChanged={sessionChanged}
      role="seller"
    >
      <div className="content" data-plan="seller-dashboard-shell">
        <h2>Active Section: {active}</h2>
        <p>Seller Workspace Construction Plan Shell</p>
        <p>Live session status: {sessionChanged ? "Session update pending" : "Synchronized"}</p>
      </div>
    </DashboardLayout>
  );
}
