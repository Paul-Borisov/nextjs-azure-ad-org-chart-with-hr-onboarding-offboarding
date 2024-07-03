import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type UserPhotos = { [id: string]: string };

const initialState = {
  photos: <UserPhotos>{},
};

const sliceUserPhotos = createSlice({
  name: "userPhotos",
  initialState,
  reducers: {
    setDataSync: (state, action) => {
      state.photos = action.payload.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      //.addCase(loadPhotosAsync.pending, () => {
      //  console.log("loadPhotosAsync executing...");
      //})
      .addCase(loadPhotosAsync.fulfilled, (state, action) => {
        if (Object.keys(action.payload).length > 0) {
          state.photos = action.payload;
        }
      });
  },
});

let loading = false;
export const loadPhotosAsync = createAsyncThunk(
  "loadPhotosAsync",
  async (loadPhotosFromDatabase: () => Promise<any>) => {
    if (loading) return {};
    loading = true;
    const data: UserPhotos = await new Promise((resolve) => {
      loadPhotosFromDatabase()
        .then((photos: UserPhotos) => {
          loading = false;
          resolve(photos);
        })
        .catch((error) => {
          console.log(error);
          loading = false;
          resolve({});
        });
    });
    return data;
  }
);

export const { setDataSync } = sliceUserPhotos.actions;

export default sliceUserPhotos.reducer;
