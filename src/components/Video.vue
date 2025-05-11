<template>
  <!-- <v-container> -->
  <video
    ref="video"
    autoplay
    playsinline
    muted
    style="width: 50%; height: auto; border: 1px solid red"
  ></video>
  <!-- </v-container> -->
</template>

<script>
import { onMounted, ref, onUnmounted } from "vue";
import { extractDomain } from "@/utils/domainUtils";

export default {
  setup() {
    const video = ref(null);
    const socket = ref(null);
    const pc = ref(null);

    onMounted(async () => {
      const url = extractDomain(import.meta.env.VITE_REMOTE_HOST);

      // Connect to WebSocket server
      socket.value = new WebSocket(`ws://${url}/ws/video/`);

      socket.value.onopen = async () => {
        console.log("WebSocket connected");

        // Create peer connection
        pc.value = new RTCPeerConnection();

        // Handle incoming ICE candidates if needed later

        // Set up video receiver
        pc.value.addTransceiver("video", { direction: "recvonly" });

        pc.value.ontrack = (event) => {
          console.log("Received track event:", event);

          if (event.streams.length > 0) {
            const stream = event.streams[0];
            const videoTracks = stream.getVideoTracks();
            console.log("Video tracks received:", videoTracks);

            if (videoTracks.length > 0 && video.value) {
              video.value.srcObject = stream;
            } else {
              console.warn("No video tracks found!");
            }
          } else {
            console.warn("No streams attached to track event");
          }
        };

        pc.value.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.value.iceConnectionState);
        };

        const offer = await pc.value.createOffer();
        await pc.value.setLocalDescription(offer);

        socket.value.send(
          JSON.stringify({
            sdp: pc.value.localDescription.sdp,
            type: pc.value.localDescription.type,
          })
        );
      };

      socket.value.onmessage = async (event) => {
        console.log("Received message:", event.data);

        const data = JSON.parse(event.data);

        if (data.sdp) {
          const remoteDesc = new RTCSessionDescription(data);
          await pc.value.setRemoteDescription(remoteDesc);
        }
      };

      socket.value.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.value.onclose = () => {
        console.log("WebSocket closed");
      };
    });

    onUnmounted(() => {
      if (socket) {
        socket.value.close();
      }
    });

    return {
      video,
    };
  },
};
</script>
