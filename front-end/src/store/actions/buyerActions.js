/**
 * buyerActions.js
 * Purpose: Central action exports for the Buyer module.
 *          Re-exports Redux Toolkit generated actions and async thunks
 *          from buyerSlice.js to avoid duplicate action definitions.
 */
export {
  // Async thunks
  fetchBuyerCatalog,
  fetchBuyerDeals,
  fetchBuyerVisits,
  fetchBuyerBilling,
  reloadBuyerResource,
  reloadAllBuyerData,

  // Slice actions
  toggleShortlist,
  addConsidering,
  removeConsidering,
  setShortlist,
  setConsidering,
  setDetailCard,
  closeDetailModal,
  openOfferModal,
  closeOfferModal,
  openVisitModal,
  closeVisitModal,
  openContactModal,
  closeContactModal,
  setOfferDoneMessage,
  closeOfferDoneModal,
  closeAllModals,
} from '../slices/buyerSlice.js';
