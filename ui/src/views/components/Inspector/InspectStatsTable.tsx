import React from 'react';
import {
  FieldType,
  formattedValueToString,
  getDisplayProcessor,
  DatavTheme,
  QueryResultMetaStat,
  TimeZone,
  currentTheme,
} from 'src/packages/datav-core/src';
import { stylesFactory, useTheme } from 'src/packages/datav-core/src';
import { css } from 'emotion';

interface InspectStatsTableProps {
  timeZone: TimeZone;
  name: string;
  stats: QueryResultMetaStat[];
}

export const InspectStatsTable: React.FC<InspectStatsTableProps> = ({ timeZone, name, stats }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  if (!stats || !stats.length) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className="section-heading">{name}</div>
      <table className="filter-table width-30">
        <tbody>
          {stats.map((stat, index) => {
            return (
              <tr key={`${stat.displayName}-${index}`}>
                <td>{stat.displayName}</td>
                <td className={styles.cell}>{formatStat(stat, timeZone)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

function formatStat(stat: QueryResultMetaStat, timeZone?: TimeZone): string {
  const display = getDisplayProcessor({
    field: {
      type: FieldType.number,
      config: stat,
    },
    timeZone,
  });
  return formattedValueToString(display(stat.value));
}

const getStyles = stylesFactory((theme: DatavTheme) => {
  return {
    wrapper: css`
      padding-bottom: ${theme.spacing.md};
    `,
    cell: css`
      text-align: right;
    `,
  };
});
