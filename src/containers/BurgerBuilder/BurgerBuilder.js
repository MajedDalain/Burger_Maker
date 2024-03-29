import React, {Component} from 'react';
import Burger from '../../components/Burger/Burger';
import Aux from '../hoc/Aux/Aux';
import BuilderControls from '../../components/Burger/BuilderControls/BuilderControls';
import Modal from '../../components/UI/Modal/Modal'
import classes from './BurgerBuilder.module.css';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import httpHelper from '../../components/Helper/HttpHelper';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandling from '../hoc/withErrorHandling/withErrorHandling';



class BurgerBuilder extends Component {

    constructor() {
        super();
    }

     ingridentPrices = {
        salad:1.5,
        bacon:2,
        cheese: 1.5,
        meat:2.5,
    }

    state = {
    ingridents: null,
    totalPrice: 0,
    showModal: false,
    modalLoading: false,
    error:null
    }

    componentDidMount() {
        this.getIngridents();
    }

    getIngridents = () => {
        httpHelper.get('ingridents.json')
        .then(res => {
            this.setState({
                ingridents: res.data
            })
        }).catch(error => {
            this.setState({
                error: error
            })
        });
    }

   addIngrident = (e) =>  {
    const type = e.target.name;
    if(this.state.ingridents[type] > 3) {
        return;
    }
    let newValue = this.state.ingridents[type] + 1 ;
    this.setState(prevState => ({
        ingridents : {
            ...prevState.ingridents,
            [e.target.name]: newValue
        },
        totalPrice : prevState.totalPrice + this.ingridentPrices[type]
    }))
   }

   showOrderModal = () =>  {
       this.setState({showModal: true});
   }

   hideOrderModal = () => {
    this.setState({showModal: false});
   }

   confirmOrder = () => {
    let getIngridentsIntoParams = [];
    Object.keys(this.state.ingridents).map(key => {
        getIngridentsIntoParams.push(`&${key}=${this.state.ingridents[key]}`)
    });
    
    this.props.history.push({
        pathname: '/checkout',
        search: `?totalPrice=${this.state.totalPrice}${getIngridentsIntoParams.join('')}`
    });

    //    this.setState({modalLoading: true});

     
   }


   removeIngrident = (e)  => {
    const type = e.target.name;
    let newValue = this.state.ingridents[type] - 1 ;
    if(this.state.ingridents[type] <= 0) {
        return;
    }
    this.setState(prevState => ({
        ingridents : {
            ...prevState.ingridents,
            [e.target.name]: newValue
        },
        totalPrice : prevState.totalPrice - this.ingridentPrices[type]
    }))
   }
   
    render()  {
        const orderBtnStyle = `${classes.OrderNow} ${this.state.totalPrice > 0 ? 
            classes.OrderNowActive : classes.OrderNowDisable}`;
     
        return (
        <Aux>
            {(this.state.ingridents) ? <div>
            <div className= {classes.BurgerIngridents}>
            <Burger ingridents = {this.state.ingridents}/>
            </div>
            <div className={classes.BuilderControlsContent}>
                <span className={classes.TotalPrice}>total Price: {this.state.totalPrice}{" $"}</span>
                <div className={classes.BuilderControls}>
                     <BuilderControls ingridents = {this.state.ingridents} add={this.addIngrident} remove= {this.removeIngrident}/>
                </div>
                <div>
                    <button className={orderBtnStyle} onClick={this.showOrderModal}>
                        Order Now
                    </button>
                </div>
            </div>
            </div> 
            : this.state.error ? <div className={classes.Error}>Error getting ingridents</div> 
            : <Spinner/>}
            <Modal showModal={this.state.showModal}>
                {this.state.modalLoading ? <Spinner/> 
                : this.state.ingridents ? <OrderSummary 
                totalPrice={this.state.totalPrice} 
                ingridents={this.state.ingridents}
                confirmClicked= {this.confirmOrder}
                cancelClicked={this.hideOrderModal}/> : null }
            </Modal>
            
        </Aux>
        )
    }
}

export default withErrorHandling(BurgerBuilder,httpHelper);