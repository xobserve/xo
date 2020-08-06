import { default as calculateSize } from 'calculate-size';
import { CompletionItemGroup, CompletionItem, CompletionItemKind } from '../types/completion';

export const flattenGroupItems = (groupedItems: CompletionItemGroup[]): CompletionItem[] => {
  return groupedItems.reduce((all: CompletionItem[], { items, label }) => {
    const titleItem: CompletionItem = {
      label,
      kind: CompletionItemKind.GroupTitle,
    };
    all.push(titleItem, ...items);
    return all;
  }, []);
};

export const calculateLongestLabel = (allItems: CompletionItem[]): string => {
  return allItems.reduce((longest, current) => {
    return longest.length < current.label.length ? current.label : longest;
  }, '');
};

export const calculateListSizes = (allItems: CompletionItem[], longestLabel: string) => {
  const size = calculateSize(longestLabel, {
    font: 'Menlo, Monaco, Consolas, Courier New, monospace',
    fontSize: '12px',
    fontWeight: 'normal',
  });

  const listWidth = calculateListWidth(size.width);
  const itemHeight = calculateItemHeight(size.height);
  const listHeight = calculateListHeight(itemHeight, allItems);

  return {
    listWidth,
    listHeight,
    itemHeight,
  };
};

export const calculateItemHeight = (longestLabelHeight: number) => {
  const horizontalPadding = 20;
  const itemHeight = longestLabelHeight + horizontalPadding;

  return itemHeight;
};

export const calculateListWidth = (longestLabelWidth: number) => {
  const verticalPadding = 20;
  const maxWidth = 800;
  const listWidth = Math.min(Math.max(longestLabelWidth + verticalPadding, 200), maxWidth);

  return listWidth;
};

export const calculateListHeight = (itemHeight: number, allItems: CompletionItem[]) => {
  const numberOfItemsToShow = Math.min(allItems.length, 10);
  const minHeight = 100;
  const totalHeight = numberOfItemsToShow * itemHeight;
  const listHeight = Math.max(totalHeight, minHeight);

  return listHeight;
};
