import {
  AugmentedActionContextWithDispatch,
  Namespaced,
} from "../../types/vuex_types";
import { ActionTree } from "vuex";
import { Mutations, MutationTypes } from "./mutations";
import { Account, loadPersistedState, persistState, State } from "./state";
import { RootState } from "../index";
import { getAccountStatus } from "../../api/network";
import { submitTransaction, Transaction } from "../../api/transaction";

export enum ActionTypes {
  INITIALIZE = "INITIALIZE",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  SUBMIT_TRANSACTION = "SUBMIT_TRANSACTION",
}

type ActionContextType = AugmentedActionContextWithDispatch<Mutations, State>;
type Actions = {
  [ActionTypes.INITIALIZE](actionContext: ActionContextType): Promise<void>;
  [ActionTypes.ADD_ACCOUNT](
    actionContext: ActionContextType,
    payload: { networkId: string; account: Account }
  ): Promise<string | undefined>;
  [ActionTypes.SUBMIT_TRANSACTION](
    actionContext: ActionContextType,
    payload: {networkId: string; tx: Transaction}
  ): Promise<string | undefined>;
};

export const actions: ActionTree<State, RootState> & Actions = {
  async [ActionTypes.INITIALIZE]({ commit, rootState }) {
    if (!rootState.user.password) {
      throw "Assertion user password exists failed";
    }
    try {
      const initState = await loadPersistedState(rootState.user.password);
      if (!initState) {
        return;
      }
      commit(MutationTypes.SET_INITIAL_STATE, initState);
    } catch (e) {
      console.log(e);
    }
  },
  async [ActionTypes.ADD_ACCOUNT](
    { commit, state, rootState, dispatch },
    payload
  ) {
    if (!rootState.user.password) {
      throw "Assertion user password exists failed";
    }
    if (state.accounts[payload.networkId + payload.account.address]) {
      return "Account already exists";
    }
    try {
      const accountStatus = await getAccountStatus(
        rootState.network.networks[payload.networkId].endpoint,
        payload.account.address
      );
      if (accountStatus.error) {
        return accountStatus.message;
      }
      const newAccount = { ...payload.account, ...accountStatus.account };
      commit(MutationTypes.ADD_ACCOUNT, {
        networkId: payload.networkId,
        account: newAccount,
      });
      await dispatch(
        "network/SET_SELECTED_ADDRESS",
        {
          networkId: payload.networkId,
          address: newAccount.address,
        },
        { root: true }
      );
      await persistState(state, rootState.user.password);
    } catch (e) {
      return "Error fetching network status";
    }
  },
  async [ActionTypes.SUBMIT_TRANSACTION](
    { commit, state, rootState, dispatch },
    payload
  ){
    const network = rootState.network.networks[payload.networkId];
    try {
      await submitTransaction(network.endpoint, payload.tx);
    } catch (e) {
      console.log(e);
      return "Network error";
    }
  }
};

export type NamespacedActions = Namespaced<Actions, "account">;
