import { type RenderableTreeNodes } from '@markdoc/markdoc';
import markdoc from '@markdoc/markdoc';
// eslint-disable-next-line import/default
import React, { useMemo } from 'react';

const { renderers } = markdoc;

import {
  Button,
  Code,
  Fence,
  Heading,
  Image,
  InstallationTarget,
  InstallationTargets,
  Link,
  List,
  ListItem,
  Paragraph,
  Strong,
  Table,
  TBody,
  Td,
  Th,
  THead,
  Tr,
} from '../../components';
import { Alert } from '../../components/Alert/Alert';
import { HorizontalRule } from '../../components/HorizontalRule/HorizontalRule';

export function useMarkdoc(renderableTreeNodes: RenderableTreeNodes) {
  const rendered = useMemo(
    () =>
      renderers.react(renderableTreeNodes, React, {
        components: {
          Alert,
          Heading,
          HorizontalRule,
          Paragraph,
          Button,
          Image,
          InstallationTargets,
          InstallationTarget,
          Fence,
          Code,
          Link,
          Table,
          THead,
          TBody,
          Tr,
          Th,
          Td,
          Strong,
          List,
          ListItem,
        },
      }),
    [renderableTreeNodes],
  );

  return rendered;
}
