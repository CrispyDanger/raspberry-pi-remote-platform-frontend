/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from "@/plugins";
import "@mdi/font/css/materialdesignicons.css";
import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";

// Components
axios.defaults.baseURL = `${import.meta.env.VITE_REMOTE_HOST}`;
// Composables

const app = createApp(App);

registerPlugins(app);

app.mount("#app");
