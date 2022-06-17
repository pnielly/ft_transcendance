import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

type Props = {
  option: string;
  setOption: (option: string) => void;
  modes: string[];
};

const OptionsGame = (props: Props) => {
  const { option, setOption, modes } = props;

  const handleChange = (event: SelectChangeEvent) => {
    setOption(event.target.value as string);
  };

  return (
    <Box sx={{ minWidth: '200px' }}>
      <FormControl fullWidth>
        <InputLabel id="demo-simple-select-label">Options</InputLabel>
        <Select labelId="demo-simple-select-label" id="demo-simple-select" value={option} label="Options" onChange={handleChange}>
          {modes.map((s: string, i) => (
            <MenuItem value={s} key={i * 12}>
              {s}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
export default OptionsGame;
