let ioInstance;

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const emitElectionResults = (electionId, payload) => {
  if (ioInstance) {
    ioInstance.to(`election:${electionId}`).emit("results:update", payload);
  }
};
