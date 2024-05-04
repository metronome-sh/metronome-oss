import clsx from 'clsx';
import { Highlight, Language, themes } from 'prism-react-renderer';
import { FunctionComponent, PropsWithChildren, useCallback, useState } from 'react';

import { cn, Icon } from '#app/components';

export type FenceProps = PropsWithChildren<{
  language: string;
  content: string;
  className?: string;
  process?: boolean;
  title?: string;
}>;

export const Fence: FunctionComponent<FenceProps> = ({
  language,
  // content,
  className,
  children,
  title,
}) => {
  const content = (
    Array.isArray(children)
      ? (children as string[]).join('')
      : typeof children === 'string'
        ? children
        : ''
  ).replace(/\n$/, '');

  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    // Remove comments
    const clipboardContent = content.replace(/.*\/\/.*\n/g, '');

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(clipboardContent);
    } else {
      // Deselect any selected text
      window.getSelection()?.removeAllRanges();
      document.execCommand('copy', true, clipboardContent);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [setCopied, content]);

  return (
    <div className={clsx(className, 'relative my-2 rounded-lg')}>
      <Highlight
        // {...defaultProps}
        code={content}
        language={language as Language}
        theme={themes.nightOwl}
      >
        {({ tokens, getLineProps, getTokenProps }) => (
          <>
            <div className="flex items-center justify-between rounded-t-lg border bg-muted/50 py-2 pl-4 pr-2">
              <span className="text-sm tracking-wide text-white/80 flex items-center gap-1">
                {title?.includes('.') ? (
                  <Icon.FileText />
                ) : title?.toLowerCase() === 'terminal' ? (
                  <Icon.TerminalTwo />
                ) : null}
                <span>{title}</span>
              </span>
              <div className="flex items-center">
                <button
                  className={cn(
                    'px-2 text-white text-xs space-x-1 flex items-center py-1 rounded',
                    { 'hover:bg-muted': !copied },
                  )}
                  onClick={copy}
                  disabled={copied}
                >
                  {copied ? <Icon.ClipboardCheck /> : <Icon.Clipboard />}
                  <span> {copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div
              className="overflow-auto overflow-x-scroll rounded-b-lg border border-t-0 bg-background p-4 font-mono text-sm"
              // style={style}
            >
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line, key: i });

                return (
                  <div
                    key={i}
                    {...lineProps}
                    className={clsx(lineProps.className, 'whitespace-nowrap')}
                  >
                    {title?.toLowerCase() === 'terminal' ? (
                      <span className="pr-1 opacity-50 select-none">$</span>
                    ) : null}
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token, key });

                      return (
                        <span
                          key={key}
                          {...tokenProps}
                          className={clsx(
                            tokenProps.className,
                            'whitespace-pre ',
                            key === line.length - 1 && 'pr-4',
                          )}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Highlight>
    </div>
  );
};
