// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
contract Test{
    function helloWorld() external pure
        returns (string memory result){
        result = "Zdravo, svete!";
    }
    function saberi(int16 a, int16 b) public pure returns (int16 result){
        result = a+b;
    }
    function saberi3(int16 a, int16 b, int16 c) external pure returns (int16){
        return saberi(a, saberi(b,c));
    }
    function saberido(uint n) external pure returns(uint){
        uint sum = 0;
        for (uint i = 0; i < n; i++) {
            sum+=i;
        }
        return sum;
    }
}