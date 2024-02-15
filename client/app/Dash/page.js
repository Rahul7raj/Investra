'use client'
import React from 'react'
import axios from 'axios'
import './styles.css'
import StockCard from '@/components/StockCard'
import { useState,useEffect } from 'react'
import { useRouter } from 'next/navigation'
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Popover from '@radix-ui/react-popover';
import * as Toast from '@radix-ui/react-toast';
import { MixerHorizontalIcon, Cross2Icon } from '@radix-ui/react-icons';


const Dash = () => {
    const router = useRouter();
    const [Username, setUsername] = useState('')
    const [UserStocks, setUserStocks] = useState([]);
    const [Invested, setInvested] = useState(0);
    let CurrentTotal=0;
    const [Current, setCurrent] = useState(0);
    const [BalanceAmount, setBalanceAmount] = useState(0);
    const TAGS = Array.from({ length: 50 }).map((_, i, a) => `v1.2.0-beta.${a.length - i}`);
    const [PurchaseData, setPurchaseData] = useState({
        ticker:'',
        qty:''
    })
    let stockTickersURL = "";
    const {username,balance,userId} = JSON.parse(sessionStorage.getItem('activeUser'))
    const [UserBalance, setUserBalance] = useState(balance)
    
    
    
    useEffect(() => {
        getStocks();
        getBalance();
        setUsername(username.toUpperCase());
      }, []);
    useEffect(() => {
        getCurrent();
        if (UserStocks.length != 0) {
            calculateBasicInfo();
        }
      }, [UserStocks]);


    
    const getCurrent = async()=>{
        UserStocks.forEach(stock => {
            CurrentTotal+=(stock.ltp * stock.quantity);
            setCurrent(CurrentTotal);
        });
    }
    const getBalance=async()=>{
        const jwt = sessionStorage.getItem('jwt');
            if(jwt!=0){
                axios.defaults.headers.common['token'] = `${jwt}`;
        }
        const u = sessionStorage.getItem('activeUser')
        const req={userId:userId}
        const b = await axios.post('http://localhost:4000/getBalance',req)
        // setUserBalance(b.balance)
        setUserBalance(b.data.balance)
    }
    const handleBalanceChange = async(e) =>{
        const { value } = e.target;
        await setBalanceAmount(value);
    }
    const handleBalanceAdd = async()=>{
        const jwt = sessionStorage.getItem('jwt');
            if(jwt!=0){
                axios.defaults.headers.common['token'] = `${jwt}`;
            }
        const req={balance:BalanceAmount}
        const res = await axios.post('http://localhost:4000/addBalance',req);
        getBalance();
    }
    const handlePurchaseChange = (e) =>{
        const { name, value } = e.target;
        setPurchaseData({
            ...PurchaseData,
            [name]: value,
          });
    }
    const handlePurchase = async() => {
        try {
            const jwt = sessionStorage.getItem('jwt');
            if(jwt!=0){
                axios.defaults.headers.common['token'] = `${jwt}`;
            }
            const res = await axios.post('http://localhost:4000/stocks/purchase',PurchaseData);
            await getBalance();
            await getStocks();
            //console.log(res.data)
        } catch (error) {
            console.log(error);
        }
    }
    const getStocks = async () => {
        try {
          const jwt = sessionStorage.getItem('jwt');
          if(jwt!=0){
             axios.defaults.headers.common['token'] = `${jwt}`;
          }
          const res = await axios.post("http://localhost:4000/stocks/get",{});
          //console.log(res);

          await setUserStocks(res.data);
        } catch (error) {
          console.error(error);
        }
    };
    const handleLogout = (e) => {
        //e.preventDefault();
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('activeUser')
        router.push('/');
    }
    const calculateBasicInfo = async () => {
        let totalInvested = 0;

        for (let i = 0; i < UserStocks.length; i++) {

            //generate url and get latest price
            stockTickersURL += String(UserStocks[i].ticker);
            stockTickersURL += '.XNSE,'


            //calculate total invested money  
            const amt = UserStocks[i].price * UserStocks[i].quantity;
            totalInvested += amt;
        }
        //console.log(stockTickersURL);
        const roundedInvested = Math.ceil(totalInvested * 100.00) / 100.00;
      
        setInvested(roundedInvested);
    };

  return (
    <>
        <div className="container">
            <div className="topbar">
                <p className='text-17xl font-extrabold' style={{color: "#fea240"}}>Hey, {Username}</p>
                <div className="top-buttons">
                
                <Popover.Root>
                    <Popover.Trigger asChild>
                        <button className='balance-button text-black letter-space'>+ BALANCE</button>
                    </Popover.Trigger>
                    <Popover.Portal>
                        <Popover.Content className="PopoverContent" sideOffset={5}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <p className="Text" style={{ marginBottom: 10 }}>
                                    Enter Amount
                                </p>
                                <fieldset className="Fieldset">
                                    <input className="Input" id="width" name='ticker'
                                    onChange={handleBalanceChange} defaultValue="0" />
                                    <button className='balance-add-button' onClick={handleBalanceAdd}>ADD</button>
                                </fieldset>
                                
                            </div>
                            <Popover.Close className="PopoverClose" aria-label="Close">
                            <Cross2Icon />
                            </Popover.Close>
                            <Popover.Arrow className="PopoverArrow" />
                        </Popover.Content>
                    </Popover.Portal>
                </Popover.Root>
                    <button className='logout-button letter-space ' onClick={handleLogout}>LOGOUT</button>
                </div>
            </div>
            <div className="content">
                <div className="left-side">
                    <div className="overall-stats">
                        <div className="holdings">
                            <div className="holdings-lhs">
                                <p className='font-extrabold text-11xl text-white letter-space'>{parseFloat((Invested).toFixed(2))}</p>
                                <p className='text-white my-2'>invested</p>
                            </div>
                            <div className="holdings-rhs">
                                <p className='font-extrabold text-11xl text-white letter-space'>{parseFloat((Current).toFixed(2))}</p>
                                <p className='text-white my-2'>current</p>
                            </div>
                        </div>
                        <div className="pl">
                            <p className='mx-8 font-semibold'>{parseFloat((Current-Invested).toFixed(2))}</p>
                            <p className='text-21xl mx-0 my-0 py-0'>|</p>
                            <p className='mx-8 bg-lime-600 px-4 rounded-2xl font-semibold'>{parseFloat(((Current-Invested)*100/Invested).toFixed(2))}%</p>
                        </div>
                    </div>
                    <div className="balance-buy">
                        <div className="balance">
                            <p className='font-extrabold text-5xl'>balance</p>
                            <p className='balance-amt'>{parseFloat(UserBalance).toFixed(2)}</p>
                            
                        </div>
                        <div className="buy-stocks">
                            <p className='text-21xl font-extrabold'>BUY</p>
                            <form className='buy-stocks-form' method='post'>
                                <input 
                                    className='buy-input-field' 
                                    type="text" 
                                    placeholder='name' 
                                    name='ticker'
                                    onChange={handlePurchaseChange}
                                />
                                <input 
                                    className='mb-20 buy-input-field ' 
                                    type="number" 
                                    placeholder='qty' 
                                    name='quantity'
                                    onChange={handlePurchaseChange}
                                    />
                            </form>
                            <button className='buy-confirm' onClick={handlePurchase}>CONFIRM</button>
                        </div>
                    </div>
                </div>
                <div className="right-side">
                <ScrollArea.Root className="ScrollAreaRoot">
                    <ScrollArea.Viewport className="ScrollAreaViewport">
                        <div style={{ padding: '15px 20px' }}>
                            {/* <div className="Text text-white">Tags</div> */}
                            {UserStocks.map((stock) => {
                            //console.log(stock)
                            return(<StockCard
                                handleParentStocksGet={getStocks}
                                handleParentBalanceUpdate = {getBalance}
                                key={stock._id}
                                ticker={stock.ticker}
                                inv={ Math.ceil(stock.price * stock.quantity *100.00) / 100.00}
                                qty={stock.quantity}
                                avg={ Math.ceil(stock.price * 100.00) / 100.00} 
                                ltp={stock.ltp} 
                                net={Math.ceil(stock.ltp * stock.quantity *100.00) / 100.00}
                                pl={parseFloat(((stock.ltp * stock.quantity) - (stock.price * stock.quantity)).toFixed(2))}
                            />)
                            })}
                            {/* {TAGS.map((tag) => (
          <div className="Tag" key={tag}>
            {tag}
          </div>
        ))} */}
                        </div>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar className="ScrollAreaScrollbar" orientation="vertical">
                    <ScrollArea.Thumb className="ScrollAreaThumb" />
                    </ScrollArea.Scrollbar>

                    <ScrollArea.Corner className="ScrollAreaCorner" />
                    </ScrollArea.Root>
                </div>
            </div>
        </div>
    </>
  )
}

export default Dash