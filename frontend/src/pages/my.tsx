import { FC, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { NftMetadata, OutletContext } from "../types";
import axios from "axios";
import NftCard from "../components/NftCard";

const GET_AMOUNT = 6;

const Home: FC = () => {
  const [searchTokenId, setSearchTokenId] = useState<number>(0);
  const [totalNFT, setTotalNFT] = useState<number>(0);
  const [metadataArray, setMetadataArray] = useState<NftMetadata[]>([]);

  const { mintNftContract } = useOutletContext<OutletContext>();

  const getTotalSupply = async () => {
    try {
      if (!mintNftContract) return;

      const totalSupply = await mintNftContract.methods.totalSupply().call();

      setSearchTokenId(Number(totalSupply));
      setTotalNFT(Number(totalSupply));
    } catch (error) {
      console.error(error);
    }
  };

  const getNFTs = async () => {
    try {
      if (!mintNftContract) return;

      let temp: NftMetadata[] = [];

      for (let i = 0; i < GET_AMOUNT; i++) {
        const metadataURI: string = await mintNftContract.methods
          // @ts-expect-error
          .tokenURI(searchTokenId - i)
          .call();

        const response = await axios.get(metadataURI);

        temp.push({ ...response.data, tokenId: searchTokenId });
      }

      setSearchTokenId(searchTokenId - GET_AMOUNT);
      setMetadataArray(temp);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getTotalSupply();
  }, [mintNftContract]);

  useEffect(() => {
    if (totalNFT === 0) return;

    getNFTs();
  }, [totalNFT]);

  return (
    <div className="grow bg-green-100">
      <ul className="p-8 grid grid-cols-2 gap-8">
        {metadataArray?.map((v, i) => (
          <NftCard key={i} image={v.image} name={v.name} tokenId={v.tokenId!} />
        ))}
      </ul>
    </div>
  );
};

export default Home;
