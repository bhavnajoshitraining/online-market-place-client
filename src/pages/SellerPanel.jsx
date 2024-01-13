import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import axios from "axios";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Typography,
  CardContent,
  Card,
  Select,
  MenuItem,
  Divider,
  Grid,
  CardMedia
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MuiAlert from "@mui/material/Alert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Snackbar from "../components/Snackbar";


import { useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:8000/api/v1";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const SellerPanel = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");
  const [openEditForm, setOpenEditForm] = useState(false);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [openSuccessSnack, setOpenSuccessSnack] = useState(false);
  const [openErrorSnack, setOpenErrorSnack] = useState(false);
  const [successMsg, setSuccessMsg] = useState();
  const [errorMsg, setErrorMsg] = useState();
  const [products, setProducts] = useState();
  const [productId, setProductId] = useState();
  const [stock, setstock] = useState();
  const [brand, setbrand] = useState("");
  const [image, setimage] = useState("");
  const [category, setCategory] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [description, setdescription] = useState("")

  const [name, setname] = useState("");
  const [manufacturingDate, setManufacturingDate] = useState("");
  const [price, setprice] = useState();

  const [showValidationError, setshowValidationError] = useState(false);

  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("");
  const [orderData, setorderData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(()=> {
    if(!token){
      navigate("/");
  }
    if(role==="ADMIN"){
      navigate("/admin-panel");
    }else if(role==="USER"){
      navigate("/");
    }
},[])

  useEffect(()=> {
      loadMyOrders()
  },[])

  const loadMyOrders = async () => {
      try {
          const response = await axios({
              method: 'get',
              url: `${BASE_URL}/orders/all`,
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          });
          if (response.data) {
              const data = response.data.filter(item=> item.orderItems.length > 0)
              setorderData(data);
              let totalPrice=0;
              response.data.map(item=> item.orderItems.map((d)=>{ 
                  if(d.status !== 'CANCELLED'){
                      totalPrice+=d.product.price*d.quantity
                  }
                  }))
              setTotalPrice(totalPrice);
          } 
      } catch (error) {
         
          console.log(error);
      }
  }

  const approveOrder = async (id) => {
      let status = 'Delivered';
      try {
          const response = await axios({
              method: 'put',
              url: `${BASE_URL}/orders/${id}`,
              data: JSON.stringify({status: status}),
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          });
          if (response.data) {
              setSnackbarMessage("Order delivered successfully");
              setSnackbarSeverity("success");
              setOpenSnackbar(true);
          } else {
              setSnackbarMessage("Order couldn't delivered");
              setSnackbarSeverity("error");
              setOpenSnackbar(true);
          }
      } catch (error) {
          setSnackbarMessage("Order couldn't delivered");
          setSnackbarSeverity("error");
          setOpenSnackbar(true);
          console.log(error);
      }
  }

  useEffect(() => {
    if (!token) {
      navigate("/login-register");
    }
  }, []);



  const deleteProduct = async (productId) => {
    try {
      const response = await axios({
        method: "delete",
        url: BASE_URL + "/products/" + productId,
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      if (response.data) {
        setOpenSuccessSnack(true);
        setSuccessMsg("Product deleted successfully");
        setOpenEditForm(false);
        let prd = products.filter((product) => product.id !== productId);
        setProducts(prd);
        setname("");
        setprice("");
        setManufacturingDate("");
      }
    } catch (err) {
      console.log(err);
      setOpenErrorSnack(true);
      setErrorMsg("Error occured while deleting product");
    }
  };

  const editProduct = async () => {
    if (
      name === "" ||
      manufacturingDate === "" ||
      price === "" ||
      stock === "" ||
      brand === "" ||
      category === "" ||
      description === "" ||
      returnPolicy===""
    ) {
      setshowValidationError(true);
    } else {
      const productData = { name, manufacturingDate, price, brand, stock, category, description, returnPolicy };
      try {
        const response = await axios({
          method: "put",
          url: BASE_URL + "/products/update/" + productId,
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + token,
          },
          data: JSON.stringify(productData),
        });

        if (response.data) {
          setOpenSuccessSnack(true);
          setSuccessMsg("Product updated successfully");
          setOpenEditForm(false);
          let prd = products.map((product) =>
            product.id === productId ? response.data : product
          );
          setProducts(prd);
          setname("");
          setprice("");
          setManufacturingDate("");
          setbrand("");
          setCategory("");
          setdescription("");
          setReturnPolicy("");
        }
      } catch (err) {
        console.log(err);
        setOpenErrorSnack(true);
        setErrorMsg("Error occured while updating product");
      }
    }
  };

  const addProduct = async () => {
    console.log("category", category)
    if (
      name === "" ||
      brand === "" ||
      manufacturingDate === "" ||
      price === null ||
      stock === null||
      image === null ||
      category === ""||
      description === "" ||
      returnPolicy===""
    ) {
      setshowValidationError(true);
    } else {
      const productData = new FormData();
      productData.append("name", name);
      productData.append("brand", brand);
      productData.append("manufacturingDate", manufacturingDate);
      productData.append("price", price);
      productData.append("stock", stock);
      productData.append("image", image);
      productData.append("category", category);
      productData.append("description", description);
      productData.append("returnPolicy", returnPolicy);
      try {
        const response = await axios({
          method: "post",
          url: BASE_URL + "/products/",
          headers: {
            "content-type": "multipart/form-data",
            Authorization: "Bearer " + token,
          },
          data: productData,
        });

        if (response.data) {
          setOpenSuccessSnack(true);
          setSuccessMsg("Product added successfully");
          setOpenAddForm(false);
          setProducts([...products, response.data]);
          setname("");
          setprice();
          setManufacturingDate("");
          setbrand("");
          setdescription("");
          setstock()
          setReturnPolicy("");
        }
      } catch (err) {
        console.log(err);
        setOpenErrorSnack(true);
        setErrorMsg("Error occured while adding product");
      }
    }
  };

  const loadProducts = async () => {
      try {
        const response = await axios({
          method: "get",
          url: BASE_URL + "/products/my-products",
          headers: {
            "content-type": "application/json",
            Authorization: "Bearer " + token,
          }
        });
        if (response.data) {
          setProducts(response.data)
        }
      } catch (err) {
        console.log(err);
        setOpenErrorSnack(true);
        setErrorMsg("Error occured while adding product");
      }
  };

  useEffect(() => {
   loadProducts()
  }, []);

  const handleOpenEditForm = (product) => {
    setOpenEditForm(true);
    setProductId(product.id);
    setname(product.name);
    setprice(product.price);
    setManufacturingDate(product.manufacturingDate);
    setstock(product.stock);
    setbrand(product.brand)
    setdescription(product.description);
    setCategory(product.category);
    setReturnPolicy(product.returnPolicy);
  };

  const handleOpenAddForm = () => {
    setOpenAddForm(true);
  };

  return (
    <div>
      <Header />
      <Box sx={{mt: 9, padding: 1}}>
      <Dialog open={openEditForm} onClose={() => setOpenEditForm(false)}>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogContent>
            {showValidationError && (
              <Alert severity="error">All the fields are mandatory</Alert>
            )}
            <TextField
              size="small"
              label="Name"
              fullWidth
              onChange={(e) => {
                setshowValidationError(false);
                setname(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Manufacturing Date"
              fullWidth
              type="date"
              onChange={(e) => {
                setshowValidationError(false);
                setManufacturingDate(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Price"
              fullWidth
              type="number"
              onChange={(e) => {
                setshowValidationError(false);
                setprice(e.target.value);
              }}
              value={price}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="stock"
              fullWidth
              value={stock}
              type="number"
              onChange={(e) => {
                setshowValidationError(false);
                setstock(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Return Policy"
              fullWidth
              value={returnPolicy}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setReturnPolicy(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <Select
              size="small"
              label="Brand"
              fullWidth
              value={brand}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setbrand(e.target.value);
              }}
              sx={{ mt: 2 }}
            >
              <MenuItem value="Godrej">Godrej</MenuItem>
              <MenuItem value="Havells">Havells</MenuItem>
              <MenuItem value="Rio">Rio</MenuItem>
              <MenuItem value="Puma">Puma</MenuItem>
              <MenuItem value="Bata">Bata</MenuItem>
              <MenuItem value="Red Tape">Red Tape</MenuItem>
            </Select>
              <Select
              size="small"
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => {
                setshowValidationError(false);
                setCategory(e.target.value);
              }}
              sx={{ mt: 2 }}
            >
               <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Grocery">Grocery</MenuItem>
            </Select>
            <TextField
              size="small"
              label="Description"
              fullWidth
              multiline
              row={4}
              value={description}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setdescription(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
          
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditForm(false)}>Cancel</Button>
            <Button onClick={editProduct}>Update</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={openAddForm} onClose={() => setOpenAddForm(false)}>
          <DialogTitle>Add Product</DialogTitle>
          <DialogContent>
            {showValidationError && (
              <Alert severity="error">All the fields are mandatory</Alert>
            )}
            <TextField
              size="small"
              label="Name"
              fullWidth
              onChange={(e) => {
                setshowValidationError(false);
                setname(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Manufacturing Date"
              fullWidth
              type="date"
              onChange={(e) => {
                setshowValidationError(false);
                setManufacturingDate(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Price"
              fullWidth
              type="number"
              onChange={(e) => {
                setshowValidationError(false);
                setprice(e.target.value);
              }}
              value={price}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="stock"
              fullWidth
              value={stock}
              type="number"
              onChange={(e) => {
                setshowValidationError(false);
                setstock(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <TextField
              size="small"
              label="Return Policy"
              fullWidth
              value={returnPolicy}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setReturnPolicy(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
            <Select
              size="small"
              label="Brand"
              fullWidth
              value={brand}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setbrand(e.target.value);
              }}
              sx={{ mt: 2 }}
            >
              <MenuItem value="Godrej">Godrej</MenuItem>
              <MenuItem value="Havells">Havells</MenuItem>
              <MenuItem value="Rio">Rio</MenuItem>
              <MenuItem value="Puma">Puma</MenuItem>
              <MenuItem value="Bata">Bata</MenuItem>
              <MenuItem value="Red Tape">Red Tape</MenuItem>
            </Select>
              <Select
              size="small"
              label="Category"
              fullWidth
              value={category}
              onChange={(e) => {
                setshowValidationError(false);
                setCategory(e.target.value);
              }}
              sx={{ mt: 2 }}
            >
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Clothing">Clothing</MenuItem>
              <MenuItem value="Furniture">Furniture</MenuItem>
              <MenuItem value="Grocery">Grocery</MenuItem>
            </Select>
              <TextField
              size="small"
              label="Image"
              fullWidth
              type="file"
              onChange={(e) => {
                setshowValidationError(false);
                setimage(e.target.files[0]);
              }}
              sx={{ mt: 2 }}
            />
              
            <TextField
              size="small"
              label="Description"
              fullWidth
              multiline
              row={4}
              value={description}
              type="text"
              onChange={(e) => {
                setshowValidationError(false);
                setdescription(e.target.value);
              }}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddForm(false)}>Cancel</Button>
            <Button onClick={addProduct}>Add Product</Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ mt: 5, mb: 1 }}>
        <Box sx={{ mt: 10, padding: 2 }}>
              {orderData?.length>0 ?  <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <Box sx={{ padding: 1, bgcolor: "#fff", mb:1 }}>
                            <Typography component="div">Order Items</Typography>
                        </Box>
                        <Box >
                            {orderData && orderData.map(order=> order.orderItems.map((item =>
                                <Card sx={{ display: 'flex', mb:2 }}>
                                    <CardMedia
                                        component="img"
                                        sx={{ width: 200 }}
                                        image={item.product.imageUrl}
                                        alt=""
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                        <CardContent sx={{ flex: '1 0 auto' }}>
                                            <Typography component="div" variant="h5">
                                                {item.product.name}
                                            </Typography>
                                            <Typography sx={{fontSize: 14}} color="text.secondary" component="div">
                                                {`Quantity: ${item.quantity}`}
                                            </Typography>
                                            <Typography sx={{fontSize: 14}}  variant="subtitle1" color="text.secondary" component="div">
                                            {`Price: ${item.quantity*item.product.price}`}
                                            </Typography>
                                            <Typography sx={{fontSize: 14, color: "green"}}  variant="subtitle1" color="text.secondary" component="div">
                                            {`Status: ${item.status}`}
                                            </Typography>
                                        </CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1, mt:1 }}>
                                            <Button disabled={item.status!="ORDERED"} onClick={()=> approveOrder(item.id)} sx={{color: "orange"}}>Dispatch</Button>
                                        </Box>
                                    </Box>
                                </Card>
                            )))}
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ bgcolor: "#fff", paddingLeft: 2, paddingRight: 2 }}>
                            <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
                                <Typography> Revenue</Typography>
                            </Box>
                            <Divider />
                           
                            <Divider />
                            <Box sx={{ paddingTop: 2, paddingBottom: 2, bgColor: "#fff", display: "flex" }}>
                                <Typography sx={{ fontWeight: 600 }}>Total Amount</Typography>
                                <Typography sx={{ ml: "auto", fontWeight: 600 }}>{totalPrice}</Typography>
                            </Box>
                            <Divider />
                           
                        </Box>
                    </Grid>
                </Grid>: <Box sx={{display: "flex", justifyContent: "center", alignItems: "center"}}> <Typography sx={{fontSize: 25}}>No Orders yet!</Typography> </Box>}
            </Box>
            <Snackbar openSnackbar={openSnackbar} setOpenSnackbar={setOpenSnackbar} snackbarMessage={snackbarMessage} snackbarSeverity={snackbarSeverity} />
          <Box display="flex">
            <Typography variant="h5" color="initial">
              Products
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              sx={{ ml: "auto" }}
              onClick={() => handleOpenAddForm()}
            >
              Add Product
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Product (Id)</StyledTableCell>
                    <StyledTableCell align="right">Name</StyledTableCell>
                    <StyledTableCell align="right">Manufacturing Date</StyledTableCell>
                    <StyledTableCell align="right">
                      Price
                    </StyledTableCell>
                    <StyledTableCell align="right">Brand</StyledTableCell>
                    <StyledTableCell align="right">Stock</StyledTableCell>
                    <StyledTableCell align="right">Category</StyledTableCell>
                    <StyledTableCell align="right">Return Policy</StyledTableCell>
                    <StyledTableCell align="right">Actions</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products &&
                    products.map((row) => (
                      <StyledTableRow key={row.id}>
                        <StyledTableCell component="th" scope="row">
                          {row.id}
                        </StyledTableCell>
                        <StyledTableCell
                          align="right"
                          component="th"
                          scope="row"
                        >
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.manufacturingDate}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.price}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.brand}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.stock}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.category}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          {row.returnPolicy}
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <EditIcon
                            sx={{ cursor: "pointer" }}
                            onClick={() => handleOpenEditForm(row)}
                          />
                          <DeleteIcon
                            sx={{ cursor: "pointer", ml: 2 }}
                            onClick={() => deleteProduct(row.id)}
                          />
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </div>
  )
}

export default SellerPanel