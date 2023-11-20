contract MyContract {
    uint256 public number;
    fixed public sosu;

    function setNumber(uint256 __number) public {
        number = 9;
        number = 2;
        sosu = 1.2;
        for (uint i = 1; i <= 5; i++) {
                number += i;
            }
        number = 1;
        return number;
    }
}