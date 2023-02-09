const products = [];

export const getProductsReducers = (state = {products},action)=>{
    c
    switch(action.type){
        case "SUCCESS_GET_PRODUCTS":
            return {products:action.payload}
        case "FAIL_GET_PRODUCTS":
            return {error:action.payload}
        default : return state
    }
}