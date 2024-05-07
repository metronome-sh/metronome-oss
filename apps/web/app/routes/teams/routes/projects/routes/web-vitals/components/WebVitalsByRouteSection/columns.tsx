import { ScoredWebVital, WebVitalName } from '@metronome/db';
import { ColumnDef } from '@tanstack/react-table';

import { RouteDisplay } from '#app/components';

import { useWebVitalsLoaderData } from '../../hooks/useWebVitalsLoaderData';
import { DataTableColumnHeader } from './DataTableColumnHeader';
import { WebVitalCell } from './WebVitalCell';

type Column = ColumnDef<
  Awaited<ReturnType<typeof useWebVitalsLoaderData>['webVitalsBreakdownByRoute']>[number]
>;

function createSortingFunction(name: WebVitalName): Column['sortingFn'] {
  return (a, b) => {
    const aValue = a.getValue(name) as ScoredWebVital | null;
    const bValue = b.getValue(name) as ScoredWebVital | null;

    const isValueAMissing = !aValue?.values?.p75;
    const isValueBMissing = !bValue?.values?.p75;

    if (isValueAMissing && isValueBMissing) return 0;
    if (isValueAMissing) return 1;
    if (isValueBMissing) return -1;

    if (aValue?.values?.p75 && bValue?.values?.p75) {
      return aValue.values.p75 - bValue.values.p75;
    }

    return 0;
  };
}

export const columns: Column[] = [
  {
    accessorKey: 'routeId',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Route" />,
    cell: ({ row }) => {
      const route = ((row.getValue('routeId') as string) ?? '').replace('routes/', '');

      return (
        <div className="--bg-red-500">
          <RouteDisplay route={route} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'LCP',
    header: ({ column }) => <DataTableColumnHeader column={column} title="LCP" />,
    cell: ({ row }) => {
      const lcp = row.getValue('LCP') as ScoredWebVital | null;
      return <WebVitalCell name="LCP" value={lcp?.values?.p75} score={lcp?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('LCP'),
  },
  {
    accessorKey: 'FID',
    header: ({ column }) => <DataTableColumnHeader column={column} title="FID" />,
    cell: ({ row }) => {
      const fid = row.getValue('FID') as ScoredWebVital | null;
      return <WebVitalCell name="FID" value={fid?.values?.p75} score={fid?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('FID'),
  },
  {
    accessorKey: 'CLS',
    header: ({ column }) => <DataTableColumnHeader column={column} title="CLS" />,
    cell: ({ row }) => {
      const cls = row.getValue('CLS') as ScoredWebVital | null;
      return <WebVitalCell name="CLS" value={cls?.values?.p75} score={cls?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('CLS'),
  },
  {
    accessorKey: 'INP',
    header: ({ column }) => <DataTableColumnHeader column={column} title="INP" />,
    cell: ({ row }) => {
      const inp = row.getValue('INP') as ScoredWebVital | null;
      return <WebVitalCell name="INP" value={inp?.values?.p75} score={inp?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('INP'),
  },
  {
    accessorKey: 'TTFB',
    header: ({ column }) => <DataTableColumnHeader column={column} title="TTFB" />,
    cell: ({ row }) => {
      const ttfb = row.getValue('TTFB') as ScoredWebVital | null;
      return <WebVitalCell name="TTFB" value={ttfb?.values?.p75} score={ttfb?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('TTFB'),
  },
  {
    accessorKey: 'FCP',
    header: ({ column }) => <DataTableColumnHeader column={column} title="FCP" />,
    cell: ({ row }) => {
      const fcp = row.getValue('FCP') as ScoredWebVital | null;
      return <WebVitalCell name="FCP" value={fcp?.values?.p75} score={fcp?.scores?.p75} />;
    },
    sortingFn: createSortingFunction('FCP'),
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
];
