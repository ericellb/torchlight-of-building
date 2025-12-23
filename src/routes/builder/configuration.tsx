import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { ConfigurationTab } from "../../components/configuration/ConfigurationTab";
import type { ConfigurationPage } from "../../lib/save-data";
import { createEmptyConfigurationPage } from "../../lib/storage";
import {
  useBuilderActions,
  useConfigurationPage,
} from "../../stores/builderStore";

export const Route = createFileRoute("/builder/configuration")({
  component: ConfigurationPage_,
});

function ConfigurationPage_(): React.ReactNode {
  const configPage = useConfigurationPage();
  const { updateSaveData } = useBuilderActions();

  const config = configPage ?? createEmptyConfigurationPage();

  const handleUpdate = useCallback(
    (updates: Partial<ConfigurationPage>) => {
      updateSaveData((prev) => ({
        ...prev,
        configurationPage: {
          ...(prev.configurationPage ?? createEmptyConfigurationPage()),
          ...updates,
        },
      }));
    },
    [updateSaveData],
  );

  return <ConfigurationTab config={config} onUpdate={handleUpdate} />;
}
