<script setup lang="ts">
import { useRootStore } from "../../store";
import { computed } from "vue";
import IconButton from "../../components/IconButton.vue";
import { Icon } from "@iconify/vue";
import AccountActivity from "./AccountActivity.vue";
import { useRouter } from "vue-router";

const props = defineProps({
  networkID: {
    type: String,
    required: true
  },
  accountAddress: {
    type: String,
    required: true
  }
});

const store = useRootStore();
const router = useRouter();
const network = computed(() => {
  return store.state.network.networks[props.networkID];
});
const account = computed(() => {
  return store.state.account.accounts[props.networkID + props.accountAddress];
});

const sendCoins = () => {
  router.replace({name: 'sendCoins'});
}
const submitTx = () => {
  router.replace({name: 'submitTx'});
}


</script>
<template>
<div class="account-info">
  <div class="balance">
    <div class="amount">
      {{account.balance ? parseFloat(account.balance.toFixed(4)) : '---'}}
    </div>
    <div class="currency">
      {{network.currency}}s
    </div>
  </div>
  <div class="actions">
      <icon-button @click="sendCoins">
        <template #icon>
          <Icon icon="ph:arrow-bend-double-up-right-fill"></Icon>
        </template>
        <template #text>
          Send
        </template>
      </icon-button>
    <icon-button>
      <template #icon>
        <Icon icon="ph:arrow-bend-down-left-fill"></Icon>
      </template>
      <template #text>
        Receive
      </template>
    </icon-button>
    <icon-button @click="submitTx">
      <template #icon>
        <Icon icon="mdi:cog-transfer"></Icon>
      </template>
      <template #text>
        Transact
      </template>
    </icon-button>
  </div>
  <div class="activity">
      <account-activity :account="account"/>
  </div>
</div>
</template>

<style scoped lang="scss">
.account-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 31px;

  .balance {
    display: flex;
    flex-direction: column;
    .amount {
      font-size: 48px;
      font-weight: bold;
    }
    .currency {
      margin-top: -7px;
      font-size: 20px;
      font-weight: bold;
      color: #B5B5B5;
    }
  }

  .actions {
    display: flex;
    justify-content: space-evenly;
    margin-top: 55px;
  }

  .activity {
    margin-top: 56px;
  }
}
</style>
