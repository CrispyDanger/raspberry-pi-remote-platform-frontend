<template>
  <div class="d-flex">
    <v-card class="on-screen-controls" color="white">
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn @click="sendCommand('forward')"
            ><v-icon>mdi-arrow-up</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
      <v-row>
        <v-col>
          <v-btn @click="sendCommand('left')"
            ><v-icon>mdi-arrow-left</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
        <v-col>
          <v-btn @click="sendCommand('right')"
            ><v-icon>mdi-arrow-right</v-icon></v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn @click="sendCommand('down')"
            ><v-icon>mdi-arrow-down</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
    </v-card>
    <v-card>
      <a>Gamepad Connected: </a>
      <a color="green">{{ isConnected }}</a>
    </v-card>
  </div>
</template>
<script>
import { onMounted, onUnmounted, ref } from "vue";
import { useGamepad } from "@vueuse/core";
import { extractDomain } from "@/utils/domainUtils";
import { send } from "vite";

export default {
  setup() {
    const { gamepad, isConnected } = useGamepad();
    const websocket = ref(null);
    const connectionStatus = ref("Disconnected");

    const connectWebSocket = () => {
      const url = extractDomain(import.meta.env.VITE_REMOTE_HOST);
      websocket.value = new WebSocket(`ws://${url}/ws/control/`);

      websocket.value.onopen = () => {
        connectionStatus.value = "Connected";
        console.log("WebSocket connected");
      };

      websocket.value.onclose = () => {
        connectionStatus.value = "Disconnected";
        console.log("WebSocket disconnected");
      };

      websocket.value.onerror = (error) => {
        connectionStatus.value = "Error";
        console.error("WebSocket error:", error);
      };
    };

    const sendCommand = (command) => {
      websocket.send(JSON.stringify({ action: command }));
    };

    onMounted(() => {
      connectWebSocket();
    });

    onUnmounted(() => {
      if (websocket) {
        websocket.value.close();
      }
    });
    return {
      isConnected,
      sendCommand,
    };
  },
};
</script>
<style lang="scss">
.on-screen-controls {
  height: auto;
  width: 200px;
}
</style>
