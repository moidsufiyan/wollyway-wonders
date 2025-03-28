
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Making the props optional for backward compatibility
const SizeGuide = () => {
  return (
    <div>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General Sizes</TabsTrigger>
          <TabsTrigger value="bracelets">Bracelets</TabsTrigger>
          <TabsTrigger value="rings">Rings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Our items come in standard sizes. Please refer to the chart below to find the right size for you.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>US</TableHead>
                <TableHead>EU</TableHead>
                <TableHead>UK</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>XS</TableCell>
                <TableCell>0-2</TableCell>
                <TableCell>32-34</TableCell>
                <TableCell>4-6</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>S</TableCell>
                <TableCell>4-6</TableCell>
                <TableCell>36-38</TableCell>
                <TableCell>8-10</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>M</TableCell>
                <TableCell>8-10</TableCell>
                <TableCell>40-42</TableCell>
                <TableCell>12-14</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>L</TableCell>
                <TableCell>12-14</TableCell>
                <TableCell>44-46</TableCell>
                <TableCell>16-18</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>XL</TableCell>
                <TableCell>16-18</TableCell>
                <TableCell>48-50</TableCell>
                <TableCell>20-22</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="bracelets" className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            To find your bracelet size, measure your wrist circumference just below the wrist bone.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Wrist Circumference (inches)</TableHead>
                <TableHead>Wrist Circumference (cm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>XS</TableCell>
                <TableCell>5.5-6.0</TableCell>
                <TableCell>14.0-15.2</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>S</TableCell>
                <TableCell>6.0-6.5</TableCell>
                <TableCell>15.2-16.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>M</TableCell>
                <TableCell>6.5-7.0</TableCell>
                <TableCell>16.5-17.8</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>L</TableCell>
                <TableCell>7.0-7.5</TableCell>
                <TableCell>17.8-19.1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>XL</TableCell>
                <TableCell>7.5-8.0</TableCell>
                <TableCell>19.1-20.3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="rings" className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            To find your ring size, measure the inside diameter of a ring that fits you well, or the circumference of your finger.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size (US)</TableHead>
                <TableHead>Inside Diameter (mm)</TableHead>
                <TableHead>Inside Circumference (mm)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>4</TableCell>
                <TableCell>14.8</TableCell>
                <TableCell>46.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>5</TableCell>
                <TableCell>15.7</TableCell>
                <TableCell>49.3</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6</TableCell>
                <TableCell>16.5</TableCell>
                <TableCell>51.8</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7</TableCell>
                <TableCell>17.3</TableCell>
                <TableCell>54.4</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8</TableCell>
                <TableCell>18.2</TableCell>
                <TableCell>57.1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>9</TableCell>
                <TableCell>19.0</TableCell>
                <TableCell>59.7</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>10</TableCell>
                <TableCell>19.8</TableCell>
                <TableCell>62.3</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SizeGuide;
