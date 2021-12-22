const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map((page) => {
    return (
      <Button key={page} onClick={onPageChange} className="page-item">
        {page}
      </Button>
    );
  });
  return (
    <nav
      className=" vertical-center"
      style={{ margin: "10px", align: "center" }}
    >
      <ul className="pagination mx-5">{list}</ul>
    </nav>
  );
};

const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};

function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      // Part 1, step 1 code goes here
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        dispatch({ type: "FETCH_SUCCESS", payload: result.data });
      } catch (error) {
        dispatch({ type: "FETCH_FAILURE" });
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize =5;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.themoviedb.org/3/discover/movie?api_key=855f2360b3da222c6b4bfd3628cdac2c&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate",
    {
      results: [],
    }
  );
  const handlePageChange = (e) => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.results;
  console.log(page);
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }

  return (
    <Fragment>
      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        // Part 1, step 2 code goes here
        <ul className="list-group">
          {page.map((item) => (
            <li key={item.id} className="list-group-item">
              <div className="card mx-5 w-60 d-flex flex-row">
                <div className="p-2">
                  <img
                    src={
                      "https://image.tmdb.org/t/p/original/" + item.poster_path
                    }
                    style={{
                      width: "200px",
                      padding: "5px",
                      alignContent: "center",
                    }}
                    className="card-img-top"
                    alt="{item.title}"
                  />
                </div>
                <div className="p-2 w-100">
                  <div className="card-body">
                    <h1 className="card-title">{item.title}</h1>
                    <div id="content" className="py-3 w-80">
                      <h3>Overview</h3>
                      <p className="card-text">{item.overview}</p>
                      <p className="card-text py-3">
                        <b>Realease date: </b>
                        {item.release_date}
                      </p>

                      <p
                        className="card-text mt-3 float-right mt-auto"
                        style={{ fontSize: "20px" }}
                      >
                        <span style={{ fontSize: "30px" }}>
                          {item.vote_average}
                        </span>
                        /10
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination
        items={data.results}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
