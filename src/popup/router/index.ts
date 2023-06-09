import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  RouterView,
} from "vue-router";
import Login from "../views/auth/Login.vue";
import SecureVault from "../views/auth/SecureVault.vue";
import Dashboard from "../views/dashboard/index.vue";
import AccountInfo from "../views/dashboard/AccountInfo.vue";
import AddNetwork from "../views/network/AddNetwork.vue";
import CreateAccount from "../views/account/create/index.vue";
import CreateOptions from "../views/account/create/CreateOptions.vue";
import RecoverKeyPhrase from "../views/account/create/RecoverKeyPhrase.vue";
import ImportAccount from "../views/account/create/ImportAccount.vue";
import SendCoins from "../views/transactions/SendCoins.vue";
import SubmitTransaction from "../views/transactions/SubmitTransaction.vue";
import { RootState } from "../store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/secure",
    name: "secure",
    component: SecureVault,
  },
  {
    path: "/network",
    name: "Network",
    component: RouterView,
    children: [
      { path: "add", component: AddNetwork },
      {
        path: ":networkID",
        component: RouterView,
        children: [
          {
            path: "account",
            component: CreateAccount,
            children: [
              { path: "add", name: "createAccountOptions", component: CreateOptions },
              {
                path: "recover",
                name: "recoverAccount",
                component: RecoverKeyPhrase,
              },
              {
                path: "import",
                name: "importAccount",
                component: ImportAccount,
              },
            ],
          },
          {
            path: "account/:accountAddress",
            component: Dashboard,
            children: [
              {path: "", name: "networkHome", component: AccountInfo, props: true},
              { path: "send", name: "sendCoins", component: SendCoins, props: true },
              { path: "submit-tx", name: "submitTx", component: SubmitTransaction, props: true },
            ],
          },
        ],
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

/*
 * Determine route based on state of the store
 * */
export const determineInitialRouteForState = async (state: RootState) => {
  // If the passHash doesn't exist, setup passcode.
  if (!state.user.passHash) {
    await router.replace("/secure");
    return;
  }
  // If session hasn't started, start with password
  if (!state.user.password) {
    await router.replace("/login");
    return;
  }

  const network = state.network;
  const allNetworks = network.networks;
  // If no network exists, add network
  if (Object.keys(allNetworks).length === 0) {
    await router.replace("/network/add");
    return;
  }
  // Resolve selectedNetwork, fallback to first network.
  const selectedNetworkID = network.selectedNetwork;
  const selectedNetwork = selectedNetworkID
    ? allNetworks[selectedNetworkID]
    : allNetworks[0];

  // Resolve selectedAccountAddress
  let selectedAccountAddress;
  if (
    selectedNetwork.selectedAccount &&
    !!state.account.accounts[
      selectedNetwork.id + selectedNetwork.selectedAccount
    ]
  ) {
    selectedAccountAddress = selectedNetwork.selectedAccount;
  }

  // Fallback to any address.
  if (!selectedAccountAddress) {
    const networkAccountID = Object.keys(state.account.accounts).find(
      (accountID) => {
        return (
          state.account.accounts[accountID].networkId === selectedNetwork.id
        );
      }
    );
    if (networkAccountID) {
      selectedAccountAddress = state.account.accounts[networkAccountID].address;
    }
  }

  // If couldn't find any address for this network, add a new account
  if (!selectedAccountAddress) {
    await router.replace(`/network/${selectedNetwork.id}/account/add`);
    return;
  }

  // Successfully resolved a network and an account. Goto account home.
  await router.replace(
    `/network/${selectedNetwork.id}/account/${selectedAccountAddress}`
  );
};

export default router;
