/**
 * settingsSlice.js
 * Purpose: Redux slice for the System Configurations section.
 *          No API calls exist for settings — the backend has no settings
 *          endpoint. All state here is UI/form state that benefits from
 *          being in Redux so it survives navigation between dashboard tabs.
 * State:
 *   activeTab  – which settings category tab is selected
 *   form       – form field values { platformName, maintenance, uploadSize }
 *   errors     – field-level validation errors { platformName?, uploadSize? }
 * Reducers:
 *   setActiveTab(tab)          – switch the visible settings category
 *   setField({ field, value }) – update one form field and clear its error
 *   setErrors(errors)          – store validation results after a save attempt
 *   clearErrors()              – clear all validation errors
 *   resetSettings()            – restore factory defaults
 */
import { createSlice } from '@reduxjs/toolkit';

const TABS = ['General Constants', 'Database Configs', 'Security Policies', 'API Keys'];
export { TABS };

const DEFAULT_FORM = {
  platformName: 'truEstate',
  maintenance: 'false',
  uploadSize: '25',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    activeTab: TABS[0],
    form: { ...DEFAULT_FORM },
    errors: {},
  },
  reducers: {
    /** Switch to a different settings category tab. */
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },

    /** Update a single form field value and clear its error. */
    setField(state, action) {
      const { field, value } = action.payload;
      state.form[field] = value;
      delete state.errors[field]; // clear field-level error on change
    },

    /** Store validation errors after a save attempt. */
    setErrors(state, action) {
      state.errors = action.payload;
    },

    /** Clear all validation errors (e.g. after a successful save). */
    clearErrors(state) {
      state.errors = {};
    },

    /** Restore default form values and clear errors. */
    resetSettings(state) {
      state.form = { ...DEFAULT_FORM };
      state.errors = {};
      state.activeTab = TABS[0];
    },
  },
});

export const { setActiveTab, setField, setErrors, clearErrors, resetSettings } = settingsSlice.actions;

// ── Selectors ──────────────────────────────────────────────────────────────
export const selectSettingsTab = (state) => state.settings.activeTab;
export const selectSettingsForm = (state) => state.settings.form;
export const selectSettingsErrors = (state) => state.settings.errors;

export default settingsSlice.reducer;
