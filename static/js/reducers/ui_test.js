import {
  CLEAR_UI,
  UPDATE_DIALOG_TEXT,
  UPDATE_DIALOG_TITLE,
  SET_DIALOG_VISIBILITY,
  SET_WORK_HISTORY_EDIT,
  SET_WORK_DIALOG_VISIBILITY,
  SET_WORK_DIALOG_INDEX,
  TOGGLE_DASHBOARD_EXPANDER,

  clearUI,
  updateDialogText,
  updateDialogTitle,
  setDialogVisibility,
  setWorkHistoryEdit,
  setWorkDialogVisibility,
  setWorkDialogIndex,
  toggleDashboardExpander,
} from '../actions/ui';
import { INITIAL_UI_STATE } from '../reducers/ui';

import configureTestStore from 'redux-asserts';
import rootReducer from '../reducers';
import assert from 'assert';
import sinon from 'sinon';

describe('ui reducers', () => {
  let sandbox, store, dispatchThen;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    store = configureTestStore(rootReducer);
    dispatchThen = store.createDispatchThen(state => state.ui);
  });

  afterEach(() => {
    sandbox.restore();

    store = null;
    dispatchThen = null;
  });

  it('should set a dialog title', done => {
    dispatchThen(updateDialogTitle('A title'), [UPDATE_DIALOG_TITLE]).then(state => {
      assert.equal(state.dialog.title, 'A title');
      done();
    });
  });

  it('should set dialog text', done => {
    dispatchThen(updateDialogText('Some Text'), [UPDATE_DIALOG_TEXT]).then(state => {
      assert.equal(state.dialog.text, 'Some Text');
      done();
    });
  });

  it('should set dialog visibility', done => {
    dispatchThen(setDialogVisibility(true), [SET_DIALOG_VISIBILITY]).then(state => {
      assert.equal(state.dialog.visible, true);
      done();
    });
  });

  it('should clear the ui', done => {
    dispatchThen(clearUI(), [CLEAR_UI]).then(state => {
      assert.deepEqual(state, INITIAL_UI_STATE);
      done();
    });
  });

  it('should set the work history dialog visibility', done => {
    dispatchThen(setWorkDialogVisibility(true), [SET_WORK_DIALOG_VISIBILITY]).then(state => {
      assert.equal(state.workDialogVisibility, true);

      dispatchThen(setWorkDialogVisibility(false), [SET_WORK_DIALOG_VISIBILITY]).then(state => {
        assert.equal(state.workDialogVisibility, false);
        done();
      });
    });
  });

  it('should set work history edit', done => {
    dispatchThen(setWorkHistoryEdit(true), [SET_WORK_HISTORY_EDIT]).then(state => {
      assert.equal(state.workHistoryEdit, true);

      dispatchThen(setWorkHistoryEdit(false), [SET_WORK_HISTORY_EDIT]).then(state => {
        assert.equal(state.workHistoryEdit, false);
        done();
      });
    });
  });

  it('should set a work history dialog index', done => {
    dispatchThen(setWorkDialogIndex(2), [SET_WORK_DIALOG_INDEX]).then(state => {
      assert.equal(state.workDialogIndex, 2);

      dispatchThen(setWorkDialogIndex(5), [SET_WORK_DIALOG_INDEX]).then(state => {
        assert.equal(state.workDialogIndex, 5);
        done();
      });
    });
  });

  describe('dashboard expander', () => {
    it('has an empty default state', done => {
      dispatchThen({type: "undefined"}, []).then(state => {
        assert.deepEqual(state.dashboardExpander, {});
        done();
      });
    });

    it('toggles a course expander', done => {
      dispatchThen(toggleDashboardExpander(3, true), [TOGGLE_DASHBOARD_EXPANDER]).then(state => {
        assert.deepEqual(state.dashboardExpander, {
          3: true
        });
        done();
      });
    });
  });
});
