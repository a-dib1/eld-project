import '../styles/componentsStyles/Loading.css'

function Loading() {

  return (
    <div className='GlobalLoadingContainer'>
        <div className="GlobalLoadingCenterContainer">
            <div className="ppsLoaderContent">
                <div className="ppsSLoaderC">
                </div>
                <div className="ppsSLoaderC">
                  <p className="ppsLoadingTag">Loading</p>
                </div>
                <div className="ppsSLoaderC">
                  <div className="ppsDotLoader"></div>
                  <div className="ppsDotLoader"></div>
                  <div className="ppsDotLoader"></div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Loading;