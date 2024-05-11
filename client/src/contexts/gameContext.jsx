import React, { createContext, useState } from "react";
import { getBlockWithTxs, getLatestBlock } from "../api/starknet";
import { delay } from "../helpers/utilities";

export const GameContext = createContext()

const GAME_VALUES = {
  gameId: null,
  inDraft: false,
  inBattle: false,
  battlesWon: 0,
  scoreSubmitted: false
}

export const GameProvider = ({ children }) => {
  const [values, setValues] = useState({ ...GAME_VALUES })
  const [entropy, setEntropy] = useState({
    blockNumber: null,
    blockHash: null
  })

  // Client only states
  const [clientOnly, setClientOnly] = useState(true)

  const setGame = (values) => {
    setValues(prev => ({ ...prev, ...values }))
  }

  const endGame = () => {
    setValues({ ...GAME_VALUES })
  }

  const setAction = (action) => {
    if (!action) return;

    setEntropy({
      blockNumber: action.blockNumber,
      blockHash: null
    })

    fetchBlockHash(action.blockNumber);
  }

  const fetchBlockHash = async (blockNumber) => {
    let latestBlock = await getLatestBlock()

    if (latestBlock?.block_number === blockNumber) {
      return setEntropy(prev => ({
        ...prev,
        blockHash: latestBlock.block_hash
      }))
    }

    if (latestBlock?.block_number > blockNumber) {
      return specificBlockHash(blockNumber)
    }

    await delay(2000);
    return fetchBlockHash(blockNumber);
  }

  const specificBlockHash = async (blockNumber) => {
    let block = await getBlockWithTxs(blockNumber)

    if (block?.block_hash) {
      return setEntropy(prev => ({
        ...prev,
        blockHash: latestBlock.block_hash
      }))
    }

    await delay(1000);
    return specificBlockHash(blockNumber);
  }

  return (
    <GameContext.Provider
      value={{
        values,
        setGame,
        endGame,
        clientOnly,
        setClientOnly,
        setAction,
        entropy,
        setEntropy
      }}
    >
      {children}
    </GameContext.Provider>
  );
};