import React, { Dispatch, FC, FormEvent, SetStateAction } from 'react';
import { css } from 'emotion';
import { HorizontalGroup, RadioButtonGroup, stylesFactory, useTheme, Checkbox } from 'src/packages/datav-core/src/ui';
import { GrafanaTheme, SelectableValue } from 'src/packages/datav-core/src';
import { TagFilter } from 'src/views/components/TagFilter/TagFilter';
import { SearchSrv } from 'src/core/services/search';
import { DashboardQuery, SearchLayout } from '../types';
import { FormattedMessage } from 'react-intl';
import TeamPicker from 'src/views/components/Pickers/TeamPicker';

export const layoutOptions = [
  { value: SearchLayout.Folders, icon: 'folder' },
  { value: SearchLayout.List, icon: 'list-ul' },
];

const searchSrv = new SearchSrv();

type onSelectChange = (value: SelectableValue) => void;
interface Props {
  onLayoutChange: Dispatch<SetStateAction<string>>;
  onSortChange: onSelectChange;
  onStarredFilterChange?: (event: FormEvent<HTMLInputElement>) => void;
  onTagFilterChange: onSelectChange;
  onTeamChange: any
  query: DashboardQuery;
  showStarredFilter?: boolean;
  hideLayout?: boolean;
}

export const ActionRow: FC<Props> = ({
  onLayoutChange,
  onSortChange,
  onStarredFilterChange = () => {},
  onTagFilterChange,
  query,
  showStarredFilter,
  hideLayout,
  onTeamChange
}) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div className={styles.actionRow}>
      <div className={styles.rowContainer}>
        <HorizontalGroup spacing="md" width="auto">
          {!hideLayout ? (
            <RadioButtonGroup options={layoutOptions} onChange={onLayoutChange} value={query.layout} />
          ) : null}
          {/* <SortPicker onChange={onSortChange} value={query.sort} /> */}
        </HorizontalGroup>
      </div>
      <HorizontalGroup spacing="md" width="auto">
        {showStarredFilter && (
          <div className={styles.checkboxWrapper}>
            <Checkbox label={<FormattedMessage id="folder.filterStar"/> as any} onChange={onStarredFilterChange} />
          </div>
        )}

        <TeamPicker value={query.teams} onChange={onTeamChange} mutiple allowClear/>
        <TagFilter isClearable tags={query.tag} tagOptions={searchSrv.getDashboardTags} onChange={onTagFilterChange} />
       
      </HorizontalGroup>
    </div>
  );
};

ActionRow.displayName = 'ActionRow';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    actionRow: css`
      display: none;

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${theme.spacing.lg} 0;
        width: 100%;
      }
    `,
    rowContainer: css`
      margin-right: ${theme.spacing.md};
    `,
    checkboxWrapper: css`
      label {
        line-height: 1.2;
      }
    `,
  };
});
