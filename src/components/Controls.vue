<template>
  <div class="d-flex">
    <v-card class="on-screen-controls" color="white">
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn
            @mousedown="sendCommand('forward')"
            @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-up</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
      <v-row>
        <v-col>
          <v-btn @mousedown="sendCommand('left')" @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-left</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
        <v-col>
          <v-btn
            @mousedown="sendCommand('right')"
            @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-right</v-icon></v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col>
          <v-btn @mousedown="sendCommand('down')" @mouseup="sendCommand('stop')"
            ><v-icon>mdi-arrow-down</v-icon></v-btn
          >
        </v-col>
        <v-spacer />
      </v-row>
    </v-card>
    <v-card>
      <v-btn>Start</v-btn>
      <v-btn @click="sendCommand('stop')">Stop</v-btn>
    </v-card>
  </div>
</template>
<script>
import { onMounted, onUnmounted, ref, computed } from "vue";
import { useGamepad } from "@vueuse/core";
import { extractDomain } from "@/utils/domainUtils";

export default {
  setup() {
    const { gamepads, isConnected } = useGamepad();
    const controlWebsocket = ref(null);
    const connectionStatus = ref("Disconnected");

    console.log("GAMEPAD:", isConnected);

    const gamepad = computed(() =>
      gamepads.value.find((g) => g.mapping === "standard")
    );

    const connectWebSocket = () => {
      const url = extractDomain(import.meta.env.VITE_REMOTE_HOST);
      controlWebsocket.value = new WebSocket(`ws://${url}/ws/control/`);

      controlWebsocket.value.onopen = () => {
        connectionStatus.value = "Connected";
        console.log("WebSocket connected");
      };

      controlWebsocket.value.onclose = () => {
        connectionStatus.value = "Disconnected";
        console.log("WebSocket disconnected");
      };

      controlWebsocket.value.onerror = (error) => {
        connectionStatus.value = "Error";
        console.error("WebSocket error:", error);
      };
    };

    const sendCommand = (command) => {
      controlWebsocket.value.send(JSON.stringify({ action: command }));
    };

    onMounted(() => {
      connectWebSocket();
    });

    onUnmounted(() => {
      if (controlWebsocket) {
        controlWebsocket.value.close();
      }
    });
    return {
      isConnected,
      sendCommand,
      gamepad,
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
