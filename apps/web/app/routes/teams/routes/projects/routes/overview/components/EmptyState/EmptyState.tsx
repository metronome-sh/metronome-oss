import { Link } from '@remix-run/react';
import { type FunctionComponent, useEffect, useState } from 'react';

import { Alert, Button, Icon, Input, Tooltip } from '#app/components';
import { useTinyKeys } from '#app/hooks/useTinyKeys';

import { useTeamProjectLoaderData } from '../../../../hooks';

export const EmptyState: FunctionComponent = () => {
  const { project } = useTeamProjectLoaderData();
  const [showApiKey, setShowApiKey] = useState(false);

  const [apiKeySelected, setApiKeySelected] = useState(false);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 2000);
    }
  }, [copied]);

  useTinyKeys({
    '$mod+KeyC': () => {
      if (apiKeySelected) {
        navigator.clipboard?.writeText(project.apiKey);
      }
    },
  });

  return (
    <div className="flex-grow flex flex-col gap-4 items-center justify-center w-full max-w-screen-sm mx-auto">
      <Alert>
        <Icon.Rocket className="p-0.5" />
        <Alert.Title>Setting up your new project</Alert.Title>
        <Alert.Description>
          To be able to start tracking your application, you need to add the Metronome SDK to your
          Remix app.
          <div className="pt-2">
            <Link
              to="/docs"
              className="text-muted-foreground underline underline-offset-4 hover:text-primary flex gap-1 w-fit"
              target="_blank"
            >
              Go to documentation
            </Link>
          </div>
        </Alert.Description>
      </Alert>
      <Alert>
        <Icon.Key className="p-0.5" />
        <Alert.Title>Your project API Key</Alert.Title>
        <Alert.Description>
          Use this API key to configure the Metronome SDK in your application.
          <div className="flex gap-2 pt-3">
            <Input
              defaultValue={project.apiKey}
              onClick={(e) => {
                e.currentTarget.select();
                setApiKeySelected(true);
              }}
              onBlur={() => setApiKeySelected(false)}
              type={showApiKey ? 'text' : 'password'}
              readOnly
            />
            <Tooltip.Provider>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <Icon.EyeClosed /> : <Icon.Eye />}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>{showApiKey ? 'Hide' : 'Reveal'} API Key</p>
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
            <Tooltip.Provider>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="outline"
                    className="flex-shrink-0"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard?.writeText(project.apiKey);
                      setCopied(true);
                    }}
                  >
                    {copied ? (
                      <Icon.ClipboardCheck className="w-5 h-5" />
                    ) : (
                      <Icon.Clipboard className="w-5 h-5" />
                    )}
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Copy API Key</p>
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
          </div>
        </Alert.Description>
      </Alert>
      <Alert>
        <Icon.Refresh className="animate-spin transform rotate-180 p-0.5" />
        <Alert.Title>Waiting for your first event</Alert.Title>
        <Alert.Description>
          Once we receive your first event, this page will be updated with your project data.
        </Alert.Description>
      </Alert>
    </div>
  );
};
