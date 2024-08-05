'use client'
import { useState, useEffect } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import { Box, Stack, Typography, Button, Modal, TextField, CircularProgress, Grid } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import { firestore } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  orderBy,
  startAt,
  endAt,
  where
} from 'firebase/firestore';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  // We'll add our component logic here

  const [inventory, setInventory] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [filterName, setFilterName] = useState('')
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(false)
  const [filtering, setFiltering] = useState(false)

  const generateText = async (item) => {
    const propername = item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
    const categories = ["Frozen", "Produce", "Canned Good", "Baking Item", "Pasta", "Drink", "Cereal", "Dairy", "Dessert", "Other"]
    const prompt = `Given the following item ${propername}, which of the following categories does this item belong to? Categories: ${categories}. If you cannot find any group that it belongs to, place it in "Other". Do not include anything other than the category that the item belongs to in your response.`
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: prompt })
      });

      const data = await response.json()

      if (response.ok) {
        setCategory(data.output)
        console.log("here is output")
        console.log(data.output)
        return data.output
      } else {
        setCategory("Other")
      }
    } catch (error) {
      console.log("generate text catch error")
      console.error(error)
    }
  }

  // asynchronous function that grabs the inventory from firestore
    // then gets the docs from the "query snapshot"
    // creates a temp list and appends the document id and data, before setting the inventory list to the const
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)

    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.charAt(0).toUpperCase() + item.slice(1).toLowerCase())
    // const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1, category: category })
    } else {
      console.log("start loading")
      setLoading(true)
      console.log("currently loading")
      const categoryReturn = await generateText(item)
      console.log("done generating")
      setLoading(false)
      console.log("stop loading")
      await setDoc(docRef, { quantity: 1, category: categoryReturn })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1, category: category })
      }
    }
    await updateInventory()
  }

  const filter = async (searchString) => {

    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)

    const inventoryList = [];
    docs.forEach(doc => {
      const docName = doc.id
      const docId = doc.id.toLowerCase();
      const docData = doc.data();

      // Check if document ID starts with the query or matches exactly
      if (docId.startsWith(searchString.toLowerCase()) || docId === searchString.toLowerCase()) {
        inventoryList.push({ name: docName, ...docData });
      } else {
        // Check if any of the document's values start with or match the query
        for (const key in docData) {
          if (docData[key] && typeof docData[key] === 'string' &&
            (docData[key].toLowerCase().startsWith(searchString.toLowerCase()) || docData[key].toLowerCase() === searchString.toLowerCase())) {
                inventoryList.push({ name: docName, ...docData });
            break;
          }
        }
      }
    });


    setFilteredItems(inventoryList)
  }


  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={3}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      { loading && (
        <Box display = "flex" justifyContent = "center" alignItems = "center">
          <CircularProgress />
        </Box>
      )}
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Box width="800" height="100px" padding="25px" bgcolor={"#ffffff"} justifyContent={"center"} alignItems={"center"}>
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <TextField value={filterName} id="outlined-basic" label="Filter by name, category, or quantity" variant="outlined" fullWidth onChange={(e) => {
                setFilterName(e.target.value)
                if(e.target.value !== "") {
                  filter(e.target.value)
                  setFiltering(true)
                } else {
                  setFiltering(false)
                }
              }}/>
            </Grid>
            <Grid item xs={2}>
              <Button onClick={() => {
                filter(filterName)
                setFiltering(true)
                handleClose()
              }} variant="contained"><SearchIcon />Filter</Button>
            </Grid>
            <Grid item xs={1}>
              { filtering && (
                <Button onClick={() => {setFiltering(false); setFilterName("")}} variant="contained"><CloseIcon /></Button>
              )}
            </Grid>
          </Grid>
        </Box>

        <Stack width="800px" height="300px" spacing={3} overflow={'auto'}>
          { filtering && filteredItems.map(({ name, quantity, category }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                Category: {category}
              </Typography>
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
          { !filtering && inventory.map(({name, quantity, category }) =>(
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                Category: {category}
              </Typography>
              <Typography variant={'h5'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}