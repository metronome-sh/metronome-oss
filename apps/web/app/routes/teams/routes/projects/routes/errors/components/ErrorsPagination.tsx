export const ErrorsPagination: FunctionComponent<{
  currentPage: number;
  perPage: number;
  totalCount: number;
  maxPageDisplay?: number;
}> = ({ currentPage, perPage, totalCount, maxPageDisplay = 3 }) => {
  const totalPages = Math.ceil(totalCount / perPage);

  const pagesMarkup = useMemo(() => {
    let pages: JSX.Element[] = [];

    if (totalPages <= 1) {
      // No pagination needed if there's only one page or none
      return pages;
    }

    let startPage = Math.max(currentPage - Math.floor(maxPageDisplay / 2), 2);
    let endPage = Math.min(startPage + maxPageDisplay - 1, totalPages - 1);

    if (totalPages <= maxPageDisplay + 2) {
      // Adjust for small total pages; show all without ellipses
      startPage = 2;
      endPage = totalPages - 1;
    } else {
      // Ensure the endPage is always within bounds and adjust startPage if near the end
      if (currentPage + Math.floor(maxPageDisplay / 2) > totalPages - 1) {
        startPage = totalPages - maxPageDisplay - 1;
        endPage = totalPages - 1;
      }

      // Adjust startPage back if we're at the beginning
      startPage = Math.min(startPage, currentPage - Math.floor(maxPageDisplay / 2));
    }

    // First page
    pages.push(
      <Pagination.Item key={1}>
        <Pagination.Link href="?page=1" isActive={currentPage === 1}>
          1
        </Pagination.Link>
      </Pagination.Item>,
    );

    // Ellipsis after the first page if necessary
    if (startPage > 2) {
      pages.push(
        <Pagination.Item key="start-ellipsis">
          <Pagination.Ellipsis />
        </Pagination.Item>,
      );
    }

    // Middle pages
    for (let page = startPage; page <= endPage; page++) {
      pages.push(
        <Pagination.Item key={page}>
          <Pagination.Link href={`?page=${page}`} isActive={currentPage === page}>
            {page}
          </Pagination.Link>
        </Pagination.Item>,
      );
    }

    // Ellipsis before the last page if necessary
    if (endPage < totalPages - 1) {
      pages.push(
        <Pagination.Item key="end-ellipsis">
          <Pagination.Ellipsis />
        </Pagination.Item>,
      );
    }

    // Last page
    pages.push(
      <Pagination.Item key={totalPages}>
        <Pagination.Link href={`?page=${totalPages}`} isActive={currentPage === totalPages}>
          {totalPages}
        </Pagination.Link>
      </Pagination.Item>,
    );

    return pages;
  }, [totalPages, perPage, currentPage]);

  return (
    <div>
      <Pagination>
        <Pagination.Content>
          {currentPage > 1 && (
            <Pagination.Item>
              <Pagination.Previous href={`?page=${currentPage - 1}`} />
            </Pagination.Item>
          )}
          {pagesMarkup}
          {currentPage < totalPages && (
            <Pagination.Item>
              <Pagination.Next href={`?page=${currentPage + 1}`} />
            </Pagination.Item>
          )}
        </Pagination.Content>
      </Pagination>
    </div>
  );
};
