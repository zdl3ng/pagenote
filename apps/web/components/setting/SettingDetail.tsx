import {useLocation, useNavigate, useRoutes} from 'react-router-dom'
import BackSvg from '../../assets/svg/back.svg'
import React, { ReactElement } from 'react'
import Head from "next/head";

export default function SettingDetail(props: {
  children: ReactElement
  label: string | ReactElement
}) {
  const { children, label } = props
  const navigate = useNavigate();
  const location = useLocation();
  function back() {
    console.log(location,'location')
    const pathList = location.pathname.split('/');
    if(pathList.length>2){
      navigate(pathList.slice(0,pathList.length-1).join('/'))
      return
    }

    navigate('/')
  }

  return (
      <div className={''}>
        <Head>
          <title>{label}</title>
        </Head>
        <div className={'detail-nav flex items-center py-2 mb-8'}>
          <aside
              onClick={back}
              className={
                'flex items-center justify-center w-8 h-8 rounded-full hover:bg-base-300 cursor-pointer'
              }
          >
            <BackSvg className={'fill-current'}/>
          </aside>
          <div className={'text-md ml-2'}>{label}</div>
        </div>

        {children}
      </div>
  )
}
