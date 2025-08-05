const global_reducer = (state, action) => {
  throw new Error(`No Matching "${action.type}" - action type`);
};

export default global_reducer;
