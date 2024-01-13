import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Grid,
    IconButton,
    Box,
    Typography,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import Header from "../components/Header";
import { useNavigate, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Snackbar from "../components/Snackbar";

const BASE_URL = "http://localhost:8000/api/v1";

const ProductPage = () => {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [product, setProduct] = useState();
    const [similarProduct, setSimilarProduct] = useState([]);
    const { id } = useParams();
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("");
    const [added, setAdded] = useState(false);

    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    useEffect(() => {
        loadProductById();
        loadProducts();
    }, [])

    const loadProductById = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/products/by-id/${id}`);
            if (response.data) {
                setProduct(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/products/all`);
            if (response.data) {
                setSimilarProduct(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const addToCart = async () => {
        if(!token){
            navigate("/login-register")
        }
        try {
            const response = await axios({
                method: 'post',
                url: `${BASE_URL}/cart/`,
                data: JSON.stringify({ productId: product.id, quantity: quantity }),
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (response.data) {
                setSnackbarMessage("Product added to the cart successfully");
                setSnackbarSeverity("success");
                setOpenSnackbar(true);
                setAdded(true);
            } else {
                setSnackbarMessage("Couldn't add product to cart");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);

            }
        } catch (error) {
            setSnackbarMessage("Couldn't add product to cart");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            console.log(error);
        }
    }

    const buyNow = async () => {
        if(!token){
            navigate("/login-register")
        }
        if (added) {
            navigate("/my-cart")
        } else {
            try {
                const response = await axios({
                    method: 'post',
                    url: `${BASE_URL}/cart/`,
                    data: JSON.stringify({ productId: product.id, quantity: quantity }),
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                });
                if (response.data) {
                    // setSnackbarMessage("Product added to the cart successfully");
                    // setSnackbarSeverity("success");
                    // setOpenSnackbar(true);
                    navigate("/my-cart")

                } else {
                    setSnackbarMessage("Some error occured while buying product");
                    setSnackbarSeverity("error");
                    setOpenSnackbar(true);

                }
            } catch (error) {
                setSnackbarMessage("Some error occured while buying product");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                console.log(error);
            }
        }

    }

    const handleAdd = () => {
        setQuantity((prevQuantity) => prevQuantity + 1);
    };

    const handleRemove = () => {
        if (quantity >= 1) {
            setQuantity((prevQuantity) => prevQuantity - 1);
        }
    };

    return (
        <div>
            <Header />
            <div style={{ marginTop: 90, padding: 20 }}>
                {product && <Card sx={{ margin: "auto" }}>
                    <Grid container>
                        <Grid item xs={12} sm={6}>
                            <Box sx={{ display: "block" }}>
                                <CardMedia
                                    component="img"
                                    height="400"
                                    image={product.imageUrl}
                                    alt="product"
                                />
                                <Box sx={{ display: "flex", padding: 2 }}>
                                    <Button disabled={product.stock<=0} onClick={() => addToCart()} variant="contained" fullWidth sx={{ background: `linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(23,121,9,1) 41%, rgba(0,212,255,1) 100%);`, height: 50 }}>Add To Cart</Button>
                                    <Button disabled={product.stock<=0} onClick={() => buyNow()} variant="contained" fullWidth sx={{ ml: 2, background: `linear-gradient(90deg, rgba(2,0,36,1) 0%, rgba(121,9,85,1) 41%, rgba(0,212,255,1) 100%);`, height: 50 }}>Buy Now</Button>
                                </Box>
                            </Box>

                        </Grid>
                        <Grid item xs={12} sm={6} sx={{ border: "1px solid white" }}>
                            <CardContent sx={{ padding: 5 }}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {product.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Brand: ${product.brand}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Price: ₹${product.price}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Manufacturing Date: ${new Date(product.manufacturingDate).toLocaleDateString()}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Return Policy: ${product.returnPolicy}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Size: ${product.size}`}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {`Type: ${product.type}`}
                                </Typography>
                                <Typography variant="body1" sx={{ mt: 2 }}>
                                    {`${product.description}`}
                                </Typography>
                                <Grid container spacing={2} alignItems="center" sx={{ mt: 10 }}>
                                    <Grid item>
                                        <IconButton onClick={handleRemove}>
                                            <Remove sx={{ color: "red" }} />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="h6" component="span">
                                            {quantity}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        <IconButton onClick={handleAdd}>
                                            <Add sx={{ color: "green" }} />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                                {product.stock >= 5 && <Box sx={{ border: "1px solid green", borderRadius: 10, textAlign: "center", padding: 1, mt: 1 }}>
                                    <Typography sx={{ color: "green" }}>Item In Stock</Typography>
                                </Box>}
                                {product.stock < 5 && product.stock > 0 && <Box sx={{ border: "1px solid orange", borderRadius: 10, textAlign: "center", padding: 1, mt: 1 }}>
                                    <Typography sx={{ color: "orange" }}>Hurry! Only Few Items Left</Typography>
                                </Box>}
                                {product.stock <= 0 && <Box sx={{ border: "1px solid red", borderRadius: 10, textAlign: "center", padding: 1, mt: 1 }}>
                                    <Typography sx={{ color: "red" }}>Sorry! Out of Stock</Typography>
                                </Box>}
                            </CardContent>
                        </Grid>
                    </Grid>
                </Card>}
            </div>
            {product && <Box display="block" sx={{ mt: 6, padding: 5 }}>
            <Box sx={{padding: 1, bgcolor: "#fff"}}>
                <Typography variant="h6" gutterBottom sx={{fontWeight: 600}}>
                 Similar Snickers
                </Typography>
                </Box>
                <Box display="flex" sx={{ overflowX: "auto", "-webkit-scrollbar": { display: "none" }, paddingBottom: 5, marginTop: 1 }}>
                    {similarProduct
                        .filter((p) => p.brand === product.brand)
                        .map((product) => (
                            <div style={{ marginRight: 20 }}>
                                <ProductCard
                                    product={product}
                                />
                            </div>
                        ))}
                </Box>
            </Box>}
            <Snackbar openSnackbar={openSnackbar} setOpenSnackbar={setOpenSnackbar} snackbarMessage={snackbarMessage} snackbarSeverity={snackbarSeverity} />
        </div>
    );
};

export default ProductPage;
