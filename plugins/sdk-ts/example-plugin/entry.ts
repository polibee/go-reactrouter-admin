import * as React from "react";
import { getHello } from "./client.js";
import type { PluginFrontendApp, PluginFrontendModule } from "../plugin.js";

function ExamplePluginPage() {
  return React.createElement(ExamplePluginMessage);
}

function ExamplePluginMessage() {
  const [message, setMessage] = React.useState("Loading plugin response…");

  React.useEffect(() => {
    void getHello()
      .then((response) => setMessage(response.data.message))
      .catch(() => setMessage("Plugin backend is unavailable."));
  }, []);

  return React.createElement("p", null, message);
}

const module: PluginFrontendModule = {
  register(app: PluginFrontendApp) {
    app.registerResource({
      name: "hello",
      label: "Example Plugin",
      permissions: { view: "example.plugin.view" },
      routes: { path: "/admin/example_plugin__hello" },
    });
    app.registerPage({
      id: "hello",
      path: "/hello",
      component: ExamplePluginPage,
      permission: "example.plugin.view",
    });
    app.registerNavigation({
      group: "Plugins",
      title: "Example Plugin",
      url: "/admin/plugins/example.plugin/hello",
      permission: "example.plugin.view",
    });
  },
};

export function register(app: PluginFrontendApp): void {
  module.register(app);
}
