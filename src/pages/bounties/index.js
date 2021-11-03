import React, { useState, useEffect } from "react";
import Link from "next/link";
import PageWrapper from "../../components/PageWrapper";
import Sidebar from "../../components/Sidebar";
import { Select } from "../../components/Core";
import Router from 'next/router';

import useSWR from 'swr'
import fetcher from "../../utils/fetcher";
import { BountiesListRegular, BountiesListGrid } from "../../components/BountiesLists";
import { experienceLevel } from "../../utils/filters";
// 
const bountiesUrl = process.env.NEXT_PUBLIC_INTERNAL_API_URL + '/bounty';

// SSR SOLUTION - THINK IF BETTER THAN SWR
export const getServerSideProps = async ({ query }) => {
  try {
    // const res = await fetch(bountiesUrl)
    // const bounties = await res.json()
    // return {
    //   props: {
    //     bounties,
    //     query
    //   },
    // }
    return {
      props:{
        query
      }
    }
  } catch (err) {
    console.error('Failed to fetch bounty:', err)
  }
}

const getData = async (reqBody) => {
  const url = `${process.env.NEXT_PUBLIC_EXTERNAL_API_URL}/bounty/search`;
  const data = JSON.stringify(reqBody);

  try{
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: data
    });
    const newData = await res.json();
    return newData;
  }catch (err){
    console.error('Failed to fetch bounty:', err)
  }
  return [];
  
}

// const SearchGrid = ({ data }) => {
const SearchGrid = ({ bounties, query }) => {
  const [gridDisplay, setgridDisplay] = useState(false);
  const [dataFetching, setDataFetching] = useState(false)
  const [data, setdata] = useState(bounties)
  // SWR SOLUTION

  // const { filtersdata, error } = useSWR(bountiesUrl, fetcher);

  const bountiesCount = data ? data.length : 0;

  const [fullQuery, setFullQuery] = useState(query);
  const [titleValue, setTitleValue] = useState(fullQuery.title ? fullQuery.title : '');

  const updateQuery = (data) => {
    Router.push({
      pathname: '/bounties',
      query: data,
    },
      undefined, { shallow: true }
    );

    setDataFetching(true);
    // TODO !!! HANDLE ACTUAL DATA FETCHING
    console.log(fullQuery);
    const newData = getData(fullQuery);
    // console.log(newData)
    // if (newData) {
    //   setDataFetching(false);
    // //setdata(newData);
    //   console.log(newData)
    // }
  };

  const handleForm = e => {
    e.preventDefault();

    if (!titleValue) {
      setFullQuery(prevState => (
        {
          ...prevState,
          title_or_body: []
        }
      ));

      return;
    };

    setFullQuery(prevState => (
      {
        ...prevState,
        title_or_body: titleValue
      }
    ));
  }

  useEffect(() => {
    updateQuery(fullQuery);
  }, [fullQuery])

  return (
    <>
      <PageWrapper>
        <div className="bg-default-1 pt-26 pt-lg-28 pb-13 pb-lg-25">
          <div className="container">
            <div className="row">
              <div className="col-12 col-lg-4 col-md-5 col-xs-8">
                <Sidebar fullQuery setFullQuery={setFullQuery} />
              </div>
              {/* <!-- Main Body --> */}
              <div className="col-12 col-xl-8 col-lg-8">
                {/* <!-- form --> */}
                <form
                  className="search-form"
                  onSubmit={handleForm}
                >
                  <div className="filter-search-form-2 search-1-adjustment bg-white rounded-sm shadow-7 pr-6 py-6 pl-6">
                    <div className="filter-inputs">
                      <div className="form-group position-relative w-lg-45 w-xl-40 w-xxl-45 flex-grow-1">
                        <input
                          className="form-control focus-reset pl-13"
                          type="text"
                          id="keyword"
                          name="title"
                          placeholder="Find a bounty"
                          value={titleValue}
                          onChange={e => setTitleValue(e.target.value)}
                        />
                        <span className="h-100 w-px-50 pos-abs-tl d-flex align-items-center justify-content-center font-size-6">
                          <i className="icon icon-zoom-2 text-primary"></i>
                        </span>
                      </div>
                      {/* <!-- .select-city starts --> */}
                      {/* <div className="form-group position-relative w-lg-55 w-xl-60 w-xxl-55">
                        <Select
                          name="experience"
                          options={experienceLevel}
                          className="pl-8 h-100 arrow-3 font-size-4 d-flex align-items-center w-100"
                          border={false}
                          queryValue={expValue}
                          onChange={(e) => {
                            setExpValue(e.value)
                          }}
                        />
                        <span className="h-100 w-px-50 pos-abs-tl d-flex align-items-center justify-content-center font-size-6">
                          <i className="icon icon-business-agent text-primary"></i>
                        </span>
                      </div> */}
                      {/* <!-- ./select-city ends --> */}
                    </div>
                    <div className="button-block">
                      <button className="btn btn-primary line-height-reset h-100 btn-submit w-100 text-uppercase">
                        Search
                      </button>
                    </div>
                  </div>
                </form>
                <div className="pt-12">
                  <div className="d-flex align-items-center justify-content-between mb-6">
                    <h5 className="font-size-4 font-weight-normal text-gray">
                      <span className="heading-default-color">{bountiesCount}</span> results for{" "}
                      <span className="heading-default-color">UI Designer</span>
                    </h5>
                    <div className="d-flex align-items-center result-view-type">
                      <button
                        className={`heading-default-color pl-5 font-size-6 hover-text-hitgray${gridDisplay ? '' : ' active'}`}
                        onClick={() => setgridDisplay(false)}
                      >
                        <i className="fa fa-list-ul"></i>
                      </button>
                      <button
                        className={`heading-default-color pl-5 font-size-6 hover-text-hitgray${gridDisplay ? ' active' : ''}`}
                        onClick={() => setgridDisplay(true)}
                      >
                        <i className="fa fa-th-large"></i>
                      </button>
                    </div>
                  </div>

                  {data ? (gridDisplay ?
                    <BountiesListGrid data={data} />
                    :
                    <BountiesListRegular data={data} />) : <div>loading</div>
                  }

                  {/* {data ? (gridDisplay ?
                    <BountiesListGrid data={data} error={error} />
                    :
                    <BountiesListRegular data={data} error={error} />) : <div>loading</div>
                  } */}

                  <div className="text-center pt-5 pt-lg-13">
                    <Link href="/#">
                      <a className="text-green font-weight-bold text-uppercase font-size-3">
                        Load More <i className="fas fa-sort-down ml-3"></i>
                      </a>
                    </Link>
                  </div>
                </div>
                {/* <!-- form end --> */}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};
export default SearchGrid;
