const isProduction = process.env.NODE_ENV === 'production';

const MergeTree = isProduction ? 'ReplicatedMergeTree' : 'MergeTree';
const SummingMergeTree = isProduction ? 'ReplicatedSummingMergeTree' : 'SummingMergeTree';
const ReplacingMergeTree = isProduction ? 'ReplicatedReplacingMergeTree' : 'ReplacingMergeTree';
const AggregatingMergeTree = isProduction ? 'ReplicatedAggregatingMergeTree' : 'AggregatingMergeTree';
const CollapsingMergeTree = isProduction ? 'ReplicatedCollapsingMergeTree' : 'CollapsingMergeTree';
const VersionedCollapsingMergeTree = isProduction ? 'ReplicatedVersionedCollapsingMergeTree' : 'VersionedCollapsingMergeTree';
const GraphiteMergeTree = isProduction ? 'ReplicatedGraphiteMergeTree' : 'GraphiteMergeTree';

module.exports = {
  MergeTree,
  SummingMergeTree,
  ReplacingMergeTree,
  AggregatingMergeTree,
  CollapsingMergeTree,
  VersionedCollapsingMergeTree,
  GraphiteMergeTree
};